import {ipcRenderer as IPC, shell, webUtils} from "electron";

export const ipcRenderer = {
    send: IPC.send.bind(IPC),
    sendToHost: IPC.sendToHost.bind(IPC),
    sendSync: IPC.sendSync.bind(IPC),
    invoke: IPC.invoke.bind(IPC),
    on: IPC.on.bind(IPC),
    off: IPC.off.bind(IPC)
};

export {shell, webUtils};