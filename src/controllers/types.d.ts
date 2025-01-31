import { FastifyRequest } from 'fastify';
import { GameTypes, Turn } from '../constants';
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

export interface ChangeSettingsRequest {
    Querystring: ChangeSettingsRequestQuery;
}

export interface CreateGameRequestBody {
    gameType: GameTypes
}

export interface CreateGameRequestPayload extends FastifyRequest {
    body: CreateGameRequestBody
}

export type GameParams = { gameId: string }

export type OnlineGameWebsocketMessage = { 
    action: string
    move?: Position[]
}

export interface InvitePlayerRequestBody {
    playerId: string
}

export type TelegramUser = {
    id: string
    first_name: string 
    last_name: string
    photo_url: string
}
