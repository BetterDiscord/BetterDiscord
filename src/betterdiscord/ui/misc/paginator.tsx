import clsx from "clsx";
import React from "@modules/react";
import {t} from "@common/i18n";

import Button from "@ui/base/button";

const {useMemo} = React;


export interface PaginatorProps {
    className: string;
    currentPage: number;
    length: number;
    pageSize: number;
    onPageChange(newPage: number): void;
    maxVisible?: number;
}

export default function Paginator({className, currentPage, length, pageSize, onPageChange, maxVisible = 7}: PaginatorProps) {
    const max = useMemo(() => Math.ceil(length / pageSize), [length, pageSize]);

    const visiblePages = useMemo(() => {
        const visible = [];

        if (max <= maxVisible) {
            for (let index = 0; index < max; index++) {
                visible.push(index);
            }
        }
        else {
            const half = Math.trunc(maxVisible / 2);

            const m2 = maxVisible - 2;

            if (currentPage <= half) {
                for (let index = 0; index < m2; index++) {
                    visible.push(index);
                }

                visible.push("...", max - 1);
            }
            else if (currentPage >= max - half - 1) {
                visible.push(0, "...");

                for (let index = max - m2; index < max; index++) {
                    visible.push(index);
                }
            }
            else {
                const diff = Math.floor((maxVisible - 4) / 2);

                visible.push(0, "...");

                for (let index = currentPage - diff; index <= (currentPage + diff); index++) {
                    visible.push(index);
                }

                visible.push("...", max - 1);
            }
        }

        return visible;
    }, [currentPage, max, maxVisible]);

    return (
        <div className={clsx("bd-paginator", className)}>
            <Button
                className="bd-paginator-back"
                color={Button.Colors.TRANSPARENT}
                look={Button.Looks.BLANK}
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
            >
                {t("Paginator.back")}
            </Button>
            <div className="bd-paginator-bubbles">
                {visiblePages.map((value, key) => {
                    const ellipsis = value === "...";

                    return (
                        <div
                            key={key}
                            className="bd-paginator-bubble"
                            onClick={ellipsis ? () => {} : () => onPageChange(value as number)}
                            data-selected={currentPage === value}
                            data-ellipsis={ellipsis}
                        >{ellipsis ? value : (value as number) + 1}</div>
                    );
                })}
            </div>
            <Button
                className="bd-paginator-next"
                color={Button.Colors.TRANSPARENT}
                look={Button.Looks.BLANK}
                disabled={currentPage === (max - 1)}
                onClick={() => onPageChange(currentPage + 1)}
            >
                {t("Paginator.next")}
            </Button>
        </div>
    );
}