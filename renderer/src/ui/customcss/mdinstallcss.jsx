import WebpackModules from "@modules/webpackmodules";
import Patcher from "@modules/patcher";
import Utils from "@modules/api/utils";
import React from "@modules/react";

const Icon = () => (
    <div className role="button" tabIndex={-1}>
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            role="img"
        >
            <path
                id="bg"
                fill="#FFF"
                d="M12,21.5l-8-4.7v-3.8l-4-2.4l5-4.7l7-3.3l7.2,3.3l4.8,4.7l-4,2.3v3.8L12,21.5z M13,12.2V19l5-3v-2l-2.1,1.2L13,12.2z M6,16   l5,3v-6.8l-3.1,3L6,14V16z M13.4,10.5l2.9,2.7l5.2-3.1l-3-2.8L13.4,10.5z M2.6,10.1l5.1,3.1l2.9-2.7L5.5,7.3L2.6,10.1z M7.1,6.5   l4.9,3l4.9-3L12,4.1L7.1,6.5z"
            />
        </svg>
    </div>
);

const isCSS = (potentialCss) => {
    return /@import\s+(?:url\([^)]+\)|["'][^"']+["'])/i.test(potentialCss) || /[{]\s*[\w-]+:|\b[\w-]+\s*[{]\s*[\w-]+:/i.test(potentialCss);
};

class InstallCSS {
    static initialize() {
        const patch = WebpackModules.getBySource(".VOICE_HANGOUT_INVITE?\"\":");
        Patcher.after("InstallCSS", patch.ZP, "type", (_, __, res) => {
            const content = __?.[0].message.content;
            if (!content.startsWith("```css") && !isCSS(content)) return;
            const yeah = Utils.findInTree(res, x => x?.className?.includes("codeActions"), {walkable: ["props", "children"]});

            if (!yeah) return;

            yeah.children = [
                yeah.children,
                <Icon key="icon"/>
            ];
        });

    }
}

export default InstallCSS;