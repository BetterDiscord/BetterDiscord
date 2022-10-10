const css = `/* BEGIN V2 LOADER */
/* =============== */

#bd-loading-icon {
  background-image: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjAwMCAyMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAwIDIwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxwYXRoIGZpbGw9IiMzRTgyRTUiIGQ9Ik0xNDAyLjIsNjMxLjdjLTkuNy0zNTMuNC0yODYuMi00OTYtNjQyLjYtNDk2SDY4LjR2NzE0LjFsNDQyLDM5OFY0OTAuN2gyNTdjMjc0LjUsMCwyNzQuNSwzNDQuOSwwLDM0NC45SDU5Ny42djMyOS41aDE2OS44YzI3NC41LDAsMjc0LjUsMzQ0LjgsMCwzNDQuOGgtNjk5djM1NC45aDY5MS4yYzM1Ni4zLDAsNjMyLjgtMTQyLjYsNjQyLjYtNDk2YzAtMTYyLjYtNDQuNS0yODQuMS0xMjIuOS0zNjguNkMxMzU3LjcsOTE1LjgsMTQwMi4yLDc5NC4zLDE0MDIuMiw2MzEuN3oiLz48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTI2Mi41LDEzNS4yTDEyNjIuNSwxMzUuMmwtNzYuOCwwYzI2LjYsMTMuMyw1MS43LDI4LjEsNzUsNDQuM2M3MC43LDQ5LjEsMTI2LjEsMTExLjUsMTY0LjYsMTg1LjNjMzkuOSw3Ni42LDYxLjUsMTY1LjYsNjQuMywyNjQuNmwwLDEuMnYxLjJjMCwxNDEuMSwwLDU5Ni4xLDAsNzM3LjF2MS4ybDAsMS4yYy0yLjcsOTktMjQuMywxODgtNjQuMywyNjQuNmMtMzguNSw3My44LTkzLjgsMTM2LjItMTY0LjYsMTg1LjNjLTIyLjYsMTUuNy00Ni45LDMwLjEtNzIuNiw0My4xaDcyLjVjMzQ2LjIsMS45LDY3MS0xNzEuMiw2NzEtNTY3LjlWNzE2LjdDMTkzMy41LDMxMi4yLDE2MDguNywxMzUuMiwxMjYyLjUsMTM1LjJ6Ii8+PC9nPjwvc3ZnPg==);
}
#bd-loading-icon {
  position: fixed;
  bottom: 10px;
  right: 5px;
  z-index: 2147483646;
  display: block;
  width: 20px;
  height: 20px;
  background-size: 100% 100%;
  animation: bd-loading-animation 1.5s ease-in-out infinite;
}
#bd-loading-progress {
  position: fixed;
  bottom: 5px;
  right:5px;
  z-index: 2147483647;
  width: 20px;
  height: 3px;
  background-color: var(--header-primary);
  overflow: hidden;
}
#bd-loading-progress-bar {
  background-color: #3E82E5;
  width: 0%;
  height: 100%;
}

@keyframes bd-loading-animation {
  0% { opacity: 0.05; }
  50% { opacity: 0.6; }
  100% { opacity: 0.05; }
}
/* =============== */
/*  END V2 LOADER  */`;

const iconStyle = document.createElement("style");
iconStyle.textContent = css;

const loadingIcon = document.createElement("div");
loadingIcon.id = "bd-loading-icon";
loadingIcon.className = "bd-loaderv2";
loadingIcon.title = "BetterDiscord is loading...";

const loadingProgressBar = document.createElement('div');
loadingProgressBar.id = "bd-loading-progress-bar";
const loadingProgress = document.createElement('div');
loadingProgress.appendChild(loadingProgressBar);
loadingProgress.id = "bd-loading-progress";

export default class {

    static setInitStatus(percent, status = "") {
        return new Promise(
            rs => {
                if (percent > 100) percent = 100;
                if (percent < 0) percent = 0;
                loadingProgressBar.style.width = percent + "%";
                if (status) loadingIcon.title = status;
                // 60 fps, rendering wait
                setTimeout(rs, 1000/60)
            }
        )
    }

    static show() {
        document.body.appendChild(iconStyle);
        document.body.appendChild(loadingIcon);
        document.body.appendChild(loadingProgress);
    }

    static hide() {
        if (iconStyle) iconStyle.remove();
        if (loadingIcon) loadingIcon.remove();
        if (loadingProgress) loadingProgress.remove();
    }
}