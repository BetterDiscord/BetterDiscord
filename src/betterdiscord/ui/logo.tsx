import React from "@modules/react";
import {lucideToDiscordIcon} from "@utils/icon";
import {Icon, type LucideProps} from "lucide-react";

type Props = Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement> & {accent?: boolean; secondaryColor?: React.CSSProperties["color"];};
type PsuedoLucideIcon = React.ForwardRefExoticComponent<Props>;

const IconRenderer: React.FC<React.ComponentProps<typeof Icon>> = typeof (Icon as any).render === "function"
    ? (Icon as unknown as {render: React.FC<React.ComponentProps<typeof Icon>>;}).render
    : Icon;

const BDLogo = ((props: Props) => {
    const makeNode = (d: string, color: React.CSSProperties["color"] | undefined | null): [elementName: "circle" | "ellipse" | "g" | "line" | "path" | "polygon" | "polyline" | "rect", attrs: Record<string, string>] => {
        const nProps: Record<string, string> = {d};

        if (typeof color === "string") nProps.fill = color;

        return [
            "path",
            nProps
        ];
    };

    const element = IconRenderer({
        ...props,
        iconNode: [
            makeNode(
                "M1402.2,631.7c-9.7-353.4-286.2-496-642.6-496H68.4v714.1l442,398V490.7h257c274.5,0,274.5,344.9,0,344.9H597.6v329.5h169.8c274.5,0,274.5,344.8,0,344.8h-699v354.9h691.2c356.3,0,632.8-142.6,642.6-496c0-162.6-44.5-284.1-122.9-368.6C1357.7,915.8,1402.2,794.3,1402.2,631.7z",
                props.accent ? "var(--bd-brand)" : props.color || "currentcolor"
            ),
            makeNode(
                "M1262.5,135.2L1262.5,135.2l-76.8,0c26.6,13.3,51.7,28.1,75,44.3c70.7,49.1,126.1,111.5,164.6,185.3c39.9,76.6,61.5,165.6,64.3,264.6l0,1.2v1.2c0,141.1,0,596.1,0,737.1v1.2l0,1.2c-2.7,99-24.3,188-64.3,264.6c-38.5,73.8-93.8,136.2-164.6,185.3c-22.6,15.7-46.9,30.1-72.6,43.1h72.5c346.2,1.9,671-171.2,671-567.9V716.7C1933.5,312.2,1608.7,135.2,1262.5,135.2z",
                props.secondaryColor || props.color || "currentcolor"
            )
        ]
    }) as React.ReactElement<any, any>;

    return React.cloneElement(element, {
        viewBox: "0 0 2000 2000",
        enableBackground: "new 0 0 2000 2000",
        stoke: undefined
    });
}) as PsuedoLucideIcon;

export const Logo = Object.assign(BDLogo, {
    Discord: lucideToDiscordIcon(BDLogo),
    DiscordAccented: lucideToDiscordIcon(BDLogo, (m) => ({...m, accent: true}))
});

// export function Logo(props: LucideProps & {secondaryColor?: React.CSSProperties["color"];}) {
//     return (
//         <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000" enableBackground="new 0 0 2000 2000" xmlSpace="preserve">
//             <g>
//                 <path fill={props.color || "var(--bd-brand)"} d="M1402.2,631.7c-9.7-353.4-286.2-496-642.6-496H68.4v714.1l442,398V490.7h257c274.5,0,274.5,344.9,0,344.9H597.6v329.5h169.8c274.5,0,274.5,344.8,0,344.8h-699v354.9h691.2c356.3,0,632.8-142.6,642.6-496c0-162.6-44.5-284.1-122.9-368.6C1357.7,915.8,1402.2,794.3,1402.2,631.7z" />
//                 <path fill={props.secondaryColor || "#FFFFFF"} d="M1262.5,135.2L1262.5,135.2l-76.8,0c26.6,13.3,51.7,28.1,75,44.3c70.7,49.1,126.1,111.5,164.6,185.3c39.9,76.6,61.5,165.6,64.3,264.6l0,1.2v1.2c0,141.1,0,596.1,0,737.1v1.2l0,1.2c-2.7,99-24.3,188-64.3,264.6c-38.5,73.8-93.8,136.2-164.6,185.3c-22.6,15.7-46.9,30.1-72.6,43.1h72.5c346.2,1.9,671-171.2,671-567.9V716.7C1933.5,312.2,1608.7,135.2,1262.5,135.2z" />
//             </g>
//         </svg>
//     );
// }