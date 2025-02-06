import { MutableRefObject } from "react";

export interface PlayerCardProps {
    nickname: string | undefined;
    avatar: string | undefined;
    objectId: string;
    type?: string;
    refContainer?: MutableRefObject<HTMLDivElement | null>;
}