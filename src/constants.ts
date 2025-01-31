import { Game } from "./utils/game"
import { WebSocket } from "@fastify/websocket"

export const jwtTokenErrors = {
    badRequestErrorMessage: 'BAD_REQUEST_ERROR',
    badCookieRequestErrorMessage: 'BAD_COOKIE_REQUEST_ERROR',
    noAuthorizationInHeaderMessage: 'UNAUTHORIZED',
    noAuthorizationInCookieMessage: 'UNAUTHORIZED',
    authorizationTokenExpiredMessage: 'TOKEN_HAS_EXPIRED',
    authorizationTokenUntrusted: 'TOKEN_HAS_UNTRUSTED',
    authorizationTokenUnsigned: 'TOKEN_HAS_UNSIGNED',
    authorizationTokenInvalid: (error: any) => {
        return error.message
    }
}

export type CachedGame = { gameId: string, players: number[], game: Game, winner?: string, reason?: string, drawTime: number, drawRequesterId?: number, gameType: string }
export const gamesCache: Map<string, CachedGame> = new Map()
export const usersCache: Set<number> = new Set()
export const inGameCache: Map<number, WebSocket> = new Map()

export enum Piece { EMPTY = 0, WHITE_PIECE = 1, BLACK_PIECE = 2, WHITE_KING = 3, BLACK_KING = 4, SELECT = 9 }
export enum Turn { White = 1, Black = 2 }
export enum GameTypes { PRIVATE = "private", PUBLIC = "public" }
export const playerPlaces: Map<string, number> = new Map()
playerPlaces.set("White", 0)
playerPlaces.set("Black", 1)
playerPlaces.set("Draw", 2)

export const emptyBoard = [
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0]
]