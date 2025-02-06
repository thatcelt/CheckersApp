import React, { Dispatch } from "react";
import { AuthorizeResponseUser } from "../utils/types";

export interface AuthorizationContextType {
    user: AuthorizeResponseUser | null;
    token: string;
    setUser: Dispatch<React.SetStateAction<AuthorizeResponseUser | null>>
    onlineSocket: WebSocket | null;
}

export interface PlayerData {
    nickname: string | undefined;
    avatar: string | undefined;
    type: string;
    objectId: string;
}

export interface SocketContextType {
    ws: React.MutableRefObject<WebSocket | null>
    setWebSocketURI: Dispatch<React.SetStateAction<string | null>>
    setOnMessageHandler: Dispatch<SetStateAction<(gameContext: GameContextType, message: string) => void | null>>
    send: (message: any) => void;

}

export interface GameContextType {
    gameId: string;
    firstCounter: number;
    secondCounter: number;
    gameSocket: WebSocket | null;
    chipsColor: number;
    currentTurn: number;
    board: number[][];
    counterInterval: number;
    possibleMultipleMoves: number[][];
    isJumping: boolean;
    earnedWhiteChips: number;
    earnedBlackChips: number;
    players: PlayerData[];
    moves: number[][][];
    activePiece: number[] | null;
    currentColor: number;
    setCurrentColor: React.Dispatch<React.SetStateAction<number>>;
    setEarnedWhiteChips: React.Dispatch<React.SetStateAction<number>>;
    setEarnedBlackChips: React.Dispatch<React.SetStateAction<number>>;
    setPlayers: React.Dispatch<React.SetStateAction<PlayerData[]>>;
    setFirstCounter: React.Dispatch<React.SetStateAction<number>>;
    setSecondCounter: React.Dispatch<React.SetStateAction<number>>;
    setGameId: React.Dispatch<React.SetStateAction<string>>;
    setChipsColor: React.Dispatch<React.SetStateAction<number>>;
    setCurrentTurn: React.Dispatch<React.SetStateAction<number>>;
    setGameSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
    setBoard: React.Dispatch<React.SetStateAction<number[][]>>;
    setMoves: React.Dispatch<React.SetStateAction<number[][][]>>;
    setActivePiece: React.Dispatch<React.SetStateAction<number[] | null>>;
    setPossibleMultipleMoves: React.Dispatch<React.SetStateAction<number[][]>>;
    resetGame: (gameContext: GameContextType) => void;
    handleMessage: (gameContext: GameContextType, message: string) => void;
}

export interface ModalConfig {
    type?: string;
    title: string;
    message: string;
    hideButtons?: boolean;
    body?: ReactNode;
    button1?: string;
    button2?: string | undefined;
    button3?: string | undefined;
    onButton1Submit?: (arg?: string) => void;
    onButton2Submit?: (arg?: string) => void;
    onButton3Submit?: (arg?: string) => void;
    activeButton?: number;
    messageAsInput?: boolean;
    maxInputLength?: number;
}

export interface ModalContextProps {
    createModal: (modalConfig: ModalConfig) => void;
    closeModal: () => void;
}

export interface NotificationConfig {
    message: string;
    icon?:string;
    onClose?:()=>void;
    id?: number;
}

export interface NotificationContextProps {
    addNotification: (config: NotificationConfig) => void;
}

export interface NotificationProviderProps {
    children: ReactNode;
}

export interface NextMoveStructure {
    t: string;
    board: number[][];
    currentTurn: number;
    possibleMoves: number[][][];
}