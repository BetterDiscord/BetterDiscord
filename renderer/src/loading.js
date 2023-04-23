const css = `/* BEGIN V2 LOADER */
/* =============== */

#bd-loading {
  z-index: 2147483647;
  position: absolute;
  right: 0;
  bottom: 0;
  transition: 1s;
  width: 100%;
  height: 100%;
}

.theme-dark #bd-loading-icon {
  background-image: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjAwMCAyMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAwIDIwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxwYXRoIGZpbGw9IiMzRTgyRTUiIGQ9Ik0xNDAyLjIsNjMxLjdjLTkuNy0zNTMuNC0yODYuMi00OTYtNjQyLjYtNDk2SDY4LjR2NzE0LjFsNDQyLDM5OFY0OTAuN2gyNTdjMjc0LjUsMCwyNzQuNSwzNDQuOSwwLDM0NC45SDU5Ny42djMyOS41aDE2OS44YzI3NC41LDAsMjc0LjUsMzQ0LjgsMCwzNDQuOGgtNjk5djM1NC45aDY5MS4yYzM1Ni4zLDAsNjMyLjgtMTQyLjYsNjQyLjYtNDk2YzAtMTYyLjYtNDQuNS0yODQuMS0xMjIuOS0zNjguNkMxMzU3LjcsOTE1LjgsMTQwMi4yLDc5NC4zLDE0MDIuMiw2MzEuN3oiLz48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTI2Mi41LDEzNS4yTDEyNjIuNSwxMzUuMmwtNzYuOCwwYzI2LjYsMTMuMyw1MS43LDI4LjEsNzUsNDQuM2M3MC43LDQ5LjEsMTI2LjEsMTExLjUsMTY0LjYsMTg1LjNjMzkuOSw3Ni42LDYxLjUsMTY1LjYsNjQuMywyNjQuNmwwLDEuMnYxLjJjMCwxNDEuMSwwLDU5Ni4xLDAsNzM3LjF2MS4ybDAsMS4yYy0yLjcsOTktMjQuMywxODgtNjQuMywyNjQuNmMtMzguNSw3My44LTkzLjgsMTM2LjItMTY0LjYsMTg1LjNjLTIyLjYsMTUuNy00Ni45LDMwLjEtNzIuNiw0My4xaDcyLjVjMzQ2LjIsMS45LDY3MS0xNzEuMiw2NzEtNTY3LjlWNzE2LjdDMTkzMy41LDMxMi4yLDE2MDguNywxMzUuMiwxMjYyLjUsMTM1LjJ6Ii8+PC9nPjwvc3ZnPg==);
}
.theme-light #bd-loading-icon {
  background-image: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjAwMCAyMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAwIDIwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxwYXRoIGZpbGw9IiMzRTgyRTUiIGQ9Ik0xNDAyLjIsNjMxLjdjLTkuNy0zNTMuNC0yODYuMi00OTYtNjQyLjYtNDk2SDY4LjR2NzE0LjFsNDQyLDM5OFY0OTAuN2gyNTdjMjc0LjUsMCwyNzQuNSwzNDQuOSwwLDM0NC45SDU5Ny42djMyOS41aDE2OS44YzI3NC41LDAsMjc0LjUsMzQ0LjgsMCwzNDQuOGgtNjk5djM1NC45aDY5MS4yYzM1Ni4zLDAsNjMyLjgtMTQyLjYsNjQyLjYtNDk2YzAtMTYyLjYtNDQuNS0yODQuMS0xMjIuOS0zNjguNkMxMzU3LjcsOTE1LjgsMTQwMi4yLDc5NC4zLDE0MDIuMiw2MzEuN3oiLz48cGF0aCBmaWxsPSIjMDAwMDAwIiBkPSJNMTI2Mi41LDEzNS4yTDEyNjIuNSwxMzUuMmwtNzYuOCwwYzI2LjYsMTMuMyw1MS43LDI4LjEsNzUsNDQuM2M3MC43LDQ5LjEsMTI2LjEsMTExLjUsMTY0LjYsMTg1LjNjMzkuOSw3Ni42LDYxLjUsMTY1LjYsNjQuMywyNjQuNmwwLDEuMnYxLjJjMCwxNDEuMSwwLDU5Ni4xLDAsNzM3LjF2MS4ybDAsMS4yYy0yLjcsOTktMjQuMywxODgtNjQuMywyNjQuNmMtMzguNSw3My44LTkzLjgsMTM2LjItMTY0LjYsMTg1LjNjLTIyLjYsMTUuNy00Ni45LDMwLjEtNzIuNiw0My4xaDcyLjVjMzQ2LjIsMS45LDY3MS0xNzEuMiw2NzEtNTY3LjlWNzE2LjdDMTkzMy41LDMxMi4yLDE2MDguNywxMzUuMiwxMjYyLjUsMTM1LjJ6Ii8+PC9nPjwvc3ZnPg==);
}
#bd-loading-icon {
  position: fixed;
  bottom: 15px;
  right: 5px;
  display: block;
  width: 20px;
  height: 20px;
  background-size: 100% 100%;
  animation: bd-loading-animation 1.5s ease-in-out infinite;
}
#bd-loading-progress {
  position: fixed;
  bottom: 10px;
  right: 5px;
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
#bd-loading-subprogress {
  display: none;
  position: fixed;
  bottom: 6px;
  right: 5px;
  width: 20px;
  height: 1px;
  background-color: var(--header-primary);
  overflow: hidden;
}
#bd-loading-subprogress-bar {
  background-color: #3E82E5;
  width: 0%;
  height: 100%;
}

#bd-loading-status-list {
  position: absolute;
  bottom: 16px;
  right: 30px;
}
#bd-loading-substatus {
  position: absolute;
  bottom: 3px;
  right: 30px;
  white-space: nowrap;
  text-align: right;
  color: var(--header-primary);
  font-size: 12px;
}

.bd-loading-status {
  white-space: nowrap;
  text-align: right;
  font-weight: 600;
  color: var(--header-primary);
  transition: 0.2s;
}

@keyframes bd-loading-animation {
  0% { opacity: 0.05; }
  50% { opacity: 0.6; }
  100% { opacity: 0.05; }
}
/* =============== */
/*  END V2 LOADER  */`;

const IconStyle = document.createElement("style");
IconStyle.textContent = css;

const Icon = document.createElement("div");
Icon.id = "bd-loading-icon";
Icon.className = "bd-loaderv2";

const ProgressBar = document.createElement("div");
ProgressBar.id = "bd-loading-progress-bar";
const Progress = document.createElement("div");
Progress.appendChild(ProgressBar);
Progress.id = "bd-loading-progress";

const SubProgressBar = document.createElement("div");
SubProgressBar.id = "bd-loading-subprogress-bar";
const SubProgress = document.createElement("div");
SubProgress.appendChild(SubProgressBar);
SubProgress.id = "bd-loading-subprogress";

const StatusListContainer = document.createElement("div");
StatusListContainer.id = "bd-loading-status-list";

const SubStatusContainer = document.createElement("div");
SubStatusContainer.id = "bd-loading-substatus";

const Container = document.createElement("div");
Container.id = "bd-loading";
Container.appendChild(IconStyle);
Container.appendChild(Icon);
Container.appendChild(Progress);
Container.appendChild(SubProgress);
Container.appendChild(StatusListContainer);
Container.appendChild(SubStatusContainer);

export default class {

    /**
     * Sets the initial loading status of the application.
     * @param {Object} [options={}] The options object.
     * @param {number} [options.progress] The progress of the main loading bar, in percentage.
     * @param {number} [options.subprogress] The progress of the sub-loading bar, in percentage.
     * @param {string} [options.status] The status message to display.
     * @param {string} [options.substatus] The sub-status message to display.
     * @returns {Promise<void>} A Promise that resolves when the loading status has been updated.
     */
    static setInitStatus(options = {}) {
      if (typeof options !== "object" || Array.isArray(options)) {
        options = {};
      }
      const { progress, subprogress, status, substatus } = options;
      return new Promise((resolve) => {
        if (Number.isFinite(progress)) {
          if (progress > 100) progress = 100;
          if (progress < 0) progress = 0;
          ProgressBar.style.width = progress + "%";
        }
        if (Number.isFinite(subprogress)) {
          if (subprogress > 100) subprogress = 100;
          if (subprogress < 0) subprogress = 0;
          SubProgressBar.style.width = subprogress + "%";
        }
        if (typeof status === "string") {
          let StatusContainer = document.createElement("div");
          StatusContainer.className = "bd-loading-status";
          StatusContainer.innerHTML = status;
          StatusListContainer.innerHTML = "";
          StatusListContainer.append(StatusContainer);
        }
        if (typeof substatus === "string") {
          SubStatusContainer.innerText = substatus;
        }
        requestAnimationFrame(resolve);
      });
    }

    static showProgress() {
        Progress.style.display = "block";
    }

    static hideProgress() {
        Progress.style.display = "none";
    }

    static showSubProgress() {
        SubProgress.style.display = "block";
    }

    static hideSubProgress() {
        SubProgress.style.display = "none";
    }

    static show() {
        document.body.appendChild(Container);
    }

    static hide() {
        if (Container) {
          Container.style.opacity = 0;
          setTimeout(() => Container.remove(), 1000);
        };
    }
}