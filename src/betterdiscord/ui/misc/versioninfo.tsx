import DiscordModules from "@modules/discordmodules";
import pluginmanager from "@modules/pluginmanager";
import React from "@modules/react";
import {t} from "@common/i18n";
import thememanager from "@modules/thememanager";
import settings from "@stores/settings";
import Text from "@ui/base/text";
import {useStateFromStores} from "@ui/hooks";
import getDebugInfo, {getAddonCounts, getCoreInfo, getDiscordInfo} from "@utils/debug";

const {useMemo, useState, useCallback} = React;


const CLICKS_REQUIRED = 10;
const ALLOWED_IDS = new Set(["247863095647535104", "343423092670070786", "66043140208857088", "234600632567201792", "249746236008169473", "506287150984069120", "257900031351193600", "336678828233588736", "676620914632294467", "178394162381455360", "907344440945967114", "309976820109803520", "241334335884492810", "343383572805058560", "560112831371149312", "619261917352951815", "1030617301818552320", "528850043227340801", "310741793668857859", "1323433010858557523", "459937621481750528", "254362351170617345", "1019660983758766130", "515780151791976453", "398131626695196672", "538487970408300544", "917630027477159986", "226677096091484160", "174868361040232448", "155149108183695360", "262055523896131584", "116242787980017679", "403581288046526474", "76052829285916672", "332394843743584256", "224538553944637440", "238108500109033472", "777264613867257857", "102528230413578240", "678469587444170762", "219363409097916416", "582170007505731594", "354191516979429376", "468132563714703390", "323980738175434752", "801089753038061669", "415849376598982656", "68834122860077056", "384009727253807105", "247153658385399818", "306111596143443969", "508863359777505290", "278543574059057154", "282414867506528259", "231675734693773325", "234086939102281728", "316707214075101196", "382062281623863298", "282110343549812736", "332116671294734336", "188323207793606656", "557388558017495046", "300294176501923841", "385895514324992011", "264163473179672576", "340614112331694081", "374663636347650049", "152927763605618689", "133659541198864384", "295190422244950017", "135895345296048128", "220161488516546561", "110574243023966208", "437579806616322049", "153562159161278473", "490604571824226306", "253480609224065025", "502701912370577418", "112685077707665408", "98468214824001536", "399416615742996480", "214478470972047360", "678541597654253600", "179681974879911946", "211270674482724864", "583750578094735360", "135554522616561664", "741262207391629343", "124017508662378500", "194151269399527425", "267228264580382721", "709377715320651838", "402272736665272320", "427179231164760066", "98087545497206784", "354831939099688962", "137259132305539072", "147077474222604288", "516091504524132362", "712318895062515809", "124276233478471680", "521340540411838464", "1060238753823723530", "332150412763332608", "310450863845933057", "142347724392497152", "705153934758772746", "120202910586896385", "301194255731392513", "869418754348580885", "131212461499088896", "270848136006729728", "92969646403121152", "769144538107215872", "304260051915374603", "80593258903773184", "346338830011596800", "393900343135830016", "419610859392860162", "359175647257690113", "224085382474498048", "705798778472366131"]);

export default function VersionInfo() {
    const [clicks, setClicked] = useState(0);

    const currentUser = useMemo(() => DiscordModules.UserStore?.getCurrentUser()?.id, []);
    const isCanary = useStateFromStores(settings, () => settings.get("developer", "canary"));

    const discordInfo = useMemo(() => {
        const info = getDiscordInfo(false) as string[];
        return info.map((i: string) => <Text color={Text.Colors.MUTED} size={Text.Sizes.SIZE_12}>{i}</Text>);
    }, []);

    const onClick = useCallback(() => {
        DiscordNative?.clipboard?.copy(`\`\`\`md\n${getDebugInfo()}\n\`\`\``);
        if (!ALLOWED_IDS.has(currentUser)) return setClicked(1);

        const newValue = clicks + 1;
        if (newValue > CLICKS_REQUIRED) return;
        if (newValue === CLICKS_REQUIRED) settings.set("developer", "canary", !isCanary);
        setClicked(newValue);
    }, [clicks, currentUser, isCanary]);

    const onMouseLeave = useCallback(() => {
        setTimeout(() => setClicked(0), 250);
    }, []);

    const pluginCount = useStateFromStores(pluginmanager, () => getAddonCounts(pluginmanager), [], true);
    const themeCount = useStateFromStores(thememanager, () => getAddonCounts(thememanager), [], true);

    const tooltip = useMemo(() => {
        if (clicks === 0) return "Click to copy";
        if (clicks > 0 && clicks < (CLICKS_REQUIRED / 2)) return "Copied";
        if (clicks >= (CLICKS_REQUIRED / 2) && clicks < CLICKS_REQUIRED) return `${CLICKS_REQUIRED - clicks} clicks to go`;
        if (clicks >= CLICKS_REQUIRED) {
            if (isCanary) return "Switched to BD canary";
            return "Switched to BD stable";
        }
    }, [clicks, isCanary]);

    const color = useMemo(() => {
        if (clicks === 0) return "primary";
        if (clicks > 0 && clicks < (CLICKS_REQUIRED / 2)) return "green";
        if (clicks >= (CLICKS_REQUIRED / 2) && clicks < CLICKS_REQUIRED) return "yellow";
        if (clicks >= CLICKS_REQUIRED) return "brand";
    }, [clicks]);

    return <DiscordModules.Tooltip color={color} position="top" text={tooltip}>
        {(props: any) => <div {...props} className="bd-version-info" onClick={onClick} onMouseLeave={e => {props.onMouseLeave(e); onMouseLeave();}}>
            {discordInfo}
            <Text color={Text.Colors.MUTED} size={Text.Sizes.SIZE_12}>
                BD {getCoreInfo()}
            </Text>
            <Text color={Text.Colors.MUTED} size={Text.Sizes.SIZE_12}>
                {t("Panels.plugins")} {pluginCount.total} ({pluginCount.enabled} {t("Addons.isEnabled")})
            </Text>
            <Text color={Text.Colors.MUTED} size={Text.Sizes.SIZE_12}>
                {t("Panels.themes")} {themeCount.total} ({themeCount.enabled} {t("Addons.isEnabled")})
            </Text>
        </div>}
    </DiscordModules.Tooltip>;
}