import { FastifyRequest } from 'fastify';
import { GameTypes, Turn } from '../constants';
import { Position } from '../utils/getCaptures';

export interface RegisterRequestBody {
    userId: number
    username: string 
    profilePicture: string
}

export interface RegisterRequestPayload extends FastifyRequest {
    body: RegisterRequestBody
}

export interface EditProfileRequestBody {
    language: string 
    username: string 
    profilePicture: string
}

export interface EditProfileRequestPayload extends FastifyRequest {
    body: EditProfileRequestBody
}

export interface AuthorizeRequestBody {
    token: string
}

export interface AuthorizeRequestPayload extends FastifyRequest {
    body: AuthorizeRequestBody
}

export interface ChangeSettingsRequestQuery {
    possibleMoves?: boolean;
    vibration?: boolean;
}

export interface changeSettingsRequestPayload extends FastifyRequest {
    query: ChangeSettingsRequestQuery;
}

export type GetUserParams = {id: number}

export type FriendParams = {id: number}

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
