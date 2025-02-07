import { FastifyRequest } from 'fastify';
import { GameTypes, DifficultyTypes, Turn } from '../constants';
import { Position } from '../utils/getCaptures';

export interface EditProfileRequestBody {
    language: string 
    username: string 
    profilePicture: string
}

export interface EditProfileRequestPayload extends FastifyRequest {
    body: EditProfileRequestBody
}

export interface ChangeSettingsRequestQuery {
    possibleMoves?: boolean;
    vibration?: boolean;
}

export interface changeSettingsRequestPayload extends FastifyRequest {
    query: ChangeSettingsRequestQuery;
}

export type GetUserParams = {id: string}

export type FriendParams = {id: string}

export interface CreateGameRequestBody {
    gameType: GameTypes
}

export interface CreateGameRequestPayload extends FastifyRequest {
    body: CreateGameRequestBody
}

export interface CreateGameWithBotRequestBody {
    difficulty: DifficultyTypes
}
export interface CreateGameWithBotRequestPayload  extends FastifyRequest {
    body: CreateGameWithBotRequestBody
}

export type GameParams = { gameId: string }
export type GameWebsocketParams = { gameId: string, token: string }
export type OnlineWebsocketParams = { gameId: string, token: string }

export interface WebsocketQuery {
    token: string
}

export interface GameWebsocketQuery {
    token: string;
    gameId: string;
}

export interface OnlineWebsocketPayload extends FastifyRequest {
    query: WebsocketQuery
}

export interface GameWebsocketPayload extends FastifyRequest {
    query: GameWebsocketQuery,
}


export type BotGameWebsocketParams = { gameId: string, token: string };
export type OnlineGameWebsocketMessage = { 
    action: string;
    move?: Position[];
}

export type BotGameWebsocketMessage = {
    action: string;
    move?: Position[];
}

export interface InvitePlayerRequestBody {
    playerId: string;
}

export type TelegramUser = {
    username: string;
    id: string;
    first_name: string; 
    last_name: string;
    photo_url: string;
}

export type GetFriendRequestParams = { state: string }

export type User = {
    userId: string;
    username: string;
    language: string;
    profilePicture: string;
    registrationDate: string;
    scores: number;
    possibleMoves: boolean;
    vibrationOnTap: boolean;
    friends: any[];
    friendOf: any[];
    playedGames: any[];
}

export type Friendship = {
    user: User;
    friend: User;
}