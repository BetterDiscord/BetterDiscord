resources="$1"; version="$2"; lock="$3"; index="$4"; pkg="$5"; bundle="$6"; oa_asar="$7"

note() { printf '[id=post-install-%s,location=post-install,time=%s000]: %s\n' "$$" "$(date +%s)" "$1"; }

# With OpenAsar the new host's app.asar is Discord's own, set it aside and put the retained OpenAsar
# (a temporary copy in $oa_asar, "no" when there is none) in place of the asar we load.
patch() {
    if [ "$oa_asar" = "no" ]; then
        mv "$resources/app.asar" "$resources/betterdiscord.app.asar"
    else
        mv "$resources/app.asar" "$resources/app.asar.backup" \
            && mv "$oa_asar" "$resources/betterdiscord.app.asar"
    fi \
        && mkdir -p "$resources/app" \
        && printf '%s' "$index" > "$resources/app/index.js" \
        && printf '%s' "$pkg" > "$resources/app/package.json"
}
# Undo patch(), also from a half way state, so the bundle is back to what ShipIt installed.
revert() {
    rm -rf "$resources/app"
    if [ -e "$resources/app.asar.backup" ]; then
        rm -f "$resources/betterdiscord.app.asar" && mv "$resources/app.asar.backup" "$resources/app.asar"
    elif [ ! -e "$resources/app.asar" ]; then
        mv "$resources/betterdiscord.app.asar" "$resources/app.asar"
    fi
}

cleanup_tmp() { [ "$oa_asar" != "no" ] && rm -f "$oa_asar"; }
trap cleanup_tmp EXIT

# Discord can have several instances around (it relaunches itself for module updates) and each one
# may reach the updater, so only let one helper run.
[ -n "$(find "$lock" -maxdepth 0 -mmin +10 2>/dev/null)" ] && rmdir "$lock" 2>/dev/null
mkdir "$lock" 2>/dev/null || exit 0
trap 'rmdir "$lock" 2>/dev/null; cleanup_tmp' EXIT

# "<age in seconds> <pid>" for each process of this bundle that started after $since. Anything older
# is a previous instance that is still shutting down, it lives at the same path so the path alone
# can not tell them apart.
since=0
procs() {
    elapsed=$(($(date +%s) - since))
    for pid in $(pgrep -f "$bundle/Contents/MacOS/"); do
        age=$(ps -o etime= -p "$pid" 2>/dev/null | awk -F'[-:]' '{n=NF; s=$n+$(n-1)*60; if (n>=3) s+=$(n-2)*3600; if (n>=4) s+=$(n-3)*86400; print s}')
        [ -n "$age" ] && [ "$age" -le "$elapsed" ] && echo "$age $pid"
    done
}
maxage() { procs | sort -n | tail -1 | cut -d' ' -f1; }
stop() {
    for pid in $(procs | cut -d' ' -f2); do kill -TERM "$pid"; done
    i=0
    while [ -n "$(procs)" ] && [ "$i" -lt 25 ]; do i=$((i + 1)); sleep 0.2; done
    for pid in $(procs | cut -d' ' -f2); do kill -KILL "$pid"; done
}

# 1. ShipIt has validated and swapped in the pristine new bundle.
i=0
until grep -Eq "\"version\"[[:space:]]*:[[:space:]]*\"$version\"" "$resources/build_info.json" 2>/dev/null \
    && [ -f "$resources/app.asar" ] && [ ! -e "$resources/betterdiscord.app.asar" ]; do
    i=$((i + 1))
    [ "$i" -ge 1200 ] && { note "Gave up waiting for ShipIt to install $version"; exit 0; }
    sleep 0.1
done
since=$(date +%s)
note "ShipIt installed $version, waiting for its first launch"

# 2. Gatekeeper assesses a freshly installed bundle and refuses it ("is damaged") if anything inside
# was touched, so it has to be accepted untouched first. ShipIt's relauncher is held until that
# verdict is in, so a process of the new bundle that stays up a moment means it was accepted. A
# launch that gets handed to a still running old instance dies at once, keep waiting in that case.
deadline=$((since + 120))
accepted=0
while [ "$(date +%s)" -lt "$deadline" ]; do
    age=$(maxage)
    if [ -n "$age" ] && [ "$age" -ge 2 ]; then accepted=1; break; fi
    sleep 0.1
done
[ "$accepted" -eq 1 ] || { note "New host was never launched, leaving it alone"; exit 0; }
note "New host was accepted by Gatekeeper, migrating"

# 3. Quit it, patch it, start it again with BetterDiscord. If patching fails half way, undo it so
# the app is not left without anything to load.
stop
patched=0
if patch; then
    patched=1
    note "Migrated installed host $version"
else
    revert
    note "Migration of installed host failed, reverted it"
fi
since=$(date +%s)
open "$bundle"
[ "$patched" -eq 1 ] || exit 0

# 4. Make sure the patched bundle survives its launch. If Gatekeeper did refuse it, undo the patch
# so the app is not left unlaunchable. Quitting it ourselves is not a refusal, so look for the denial.
ok=0
i=0
while [ "$i" -lt 150 ]; do
    age=$(maxage)
    if [ -n "$age" ] && [ "$age" -ge 12 ]; then ok=1; break; fi
    i=$((i + 1))
    sleep 0.2
done
if [ "$ok" -eq 0 ]; then
    if /usr/bin/log show --last 90s --style compact --predicate 'process == "kernel" AND eventMessage CONTAINS "would not allow process"' 2>/dev/null | grep -q "$bundle/Contents/MacOS/"; then
        revert
        note "Gatekeeper refused the patched host, reverted it"
        since=$(date +%s)
        open "$bundle"
    else
        note "Patched host is not running, leaving it patched"
    fi
fi
