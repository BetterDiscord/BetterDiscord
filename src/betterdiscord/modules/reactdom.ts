import type ReactDOMBaseType from "react-dom";
import type ReactDOMClientType from "react-dom/client";
import {getByKeys} from "@webpack";

const base = getByKeys<typeof ReactDOMBaseType>(["createPortal"], {firstId: 340287, cacheId: "core-reactdom-base"});
const client = getByKeys<typeof ReactDOMClientType>(["createRoot"], {firstId: 507240, cacheId: "core-reactdom-client"});

const ReactDOM = Object.assign({}, base, client);
export default ReactDOM;