import { Game } from './utils/game';
import { Bot } from './utils/bot';
import { WebSocket } from '@fastify/websocket';

export type CachedGame = {
    gameId: string,
    players: string[],
    game: Game,
    bot?: Bot,
    winner?: string,
    reason?: string,
    drawTime: number,
    drawRequesterId?: string,
    gameType: string,
    creatorScores: number
};

export type PendingInvite = {
    invited: string;
    inviter: string;
};

export const pendingInvites: Map<string, PendingInvite> = new Map();

export const drawTimeoutValue = 120;
export const maxPlayers = 2;
export const scoresSearchRange: number = 100;
export const playerPlaces: Map<string, number> = new Map();
export const gamesCache: Map<string, CachedGame> = new Map();
export const usersCache: Map<string, WebSocket> = new Map();
export const inGameCache: Map<string, WebSocket> = new Map();

export const jwtTokenErrors = {
    badRequestErrorMessage: 'BAD_REQUEST_ERROR',
    badCookieRequestErrorMessage: 'BAD_COOKIE_REQUEST_ERROR',
    noAuthorizationInHeaderMessage: 'UNAUTHORIZED',
    noAuthorizationInCookieMessage: 'UNAUTHORIZED',
    authorizationTokenExpiredMessage: 'TOKEN_HAS_EXPIRED',
    authorizationTokenUntrusted: 'TOKEN_HAS_UNTRUSTED',
    authorizationTokenUnsigned: 'TOKEN_HAS_UNSIGNED',
    authorizationTokenInvalid: (error: any) => error.message
};

export const emptyBoard = [
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0]
];

export enum Piece { EMPTY = 0, WHITE_PIECE = 1, BLACK_PIECE = 2, WHITE_KING = 3, BLACK_KING = 4, SELECT = 9 };
export enum Turn { White = 1, Black = 2 };
export enum GameTypes { PRIVATE = 'private', PUBLIC = 'public' };
export enum DifficultyTypes { EASY = 'easy', MEDIUM = 'medium', HARD = 'hard' };
export type Position = [number, number];
export type Move = [Position, Position];
export const BOARD_SIZE = 8;

playerPlaces.set('WHITE', 0);
playerPlaces.set('BLACK', 1);
playerPlaces.set('Draw', 2);