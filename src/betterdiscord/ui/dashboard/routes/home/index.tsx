import React, {useCallback} from "react";
import {Stores} from "@webpack";
import HeaderBar from "../../header";
import {lucideToDiscordIcon} from "@utils/icon";
import {FishIcon, MailIcon} from "lucide-react";
import {Logo} from "@ui/logo";
import clsx from "clsx";

function Home() {
    const [transparent, setTransparent] = React.useState(true);
    const user = Stores.UserStore.getCurrentUser();
    const floatingHero = React.useRef<HTMLDivElement>(null);

    const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        setTransparent(event.currentTarget.scrollTop < 200);

        if (!floatingHero.current) return;

        floatingHero.current.style.transform = `translateY(${-event.currentTarget.scrollTop}px)`;
    }, []);

    return (
        <div className="bd-route">
            <HeaderBar
                className={clsx({"bd-header-transparent": transparent})}
                transparent={transparent}
                toolbar={
                    <>
                        <HeaderBar.Icon icon={lucideToDiscordIcon(FishIcon)} onClick={() => {}} />
                        <HeaderBar.Icon icon={lucideToDiscordIcon(FishIcon)} onClick={() => {}} />
                        <HeaderBar.Icon icon={lucideToDiscordIcon(FishIcon)} onClick={() => {}} />

                        <HeaderBar.Icon icon={lucideToDiscordIcon(MailIcon)} onClick={() => {}} />
                    </>
                }
            >
                <HeaderBar.Icon icon={Logo.Discord} />
                <HeaderBar.Title>Home</HeaderBar.Title>
            </HeaderBar>
            <div
                className="bd-route-body"
                onScroll={onScroll}
            >
                {/* <div className="bd-hero">
                    <div className="bd-hero-floating" ref={floatingHero}>
                        <Wave2 />

                        <div className="bd-hero-welcome">
                            <div className="bd-hero-greeting">Hello {user.globalName || user.username}</div>
                        </div>
                    </div>
                </div> */}
                <div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                    <div>Hello World</div>
                </div>
            </div>
        </div>
    );
}

export default Home;