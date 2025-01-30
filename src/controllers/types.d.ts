import { FastifyRequest } from "fastify"

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

export interface ChangeSettingsRequest {
    Querystring: ChangeSettingsRequestQuery;
}