import { FastifyInstance } from 'fastify';
import { createGame, drawRequest, invitePlayer, joinGame, onlineGameWebsocket, searchGame, surrender } from '../controllers/game.controller';
import { CreateGameRequestBody, GameParams, InvitePlayerRequestBody } from '../controllers/types';

export const gameRoutes = (app: FastifyInstance) => {
    app.get<{ Params: GameParams }>('/:gameId', { websocket: true }, onlineGameWebsocket);
    app.get('/searchGame', searchGame)
    app.post<{ Body: CreateGameRequestBody }>('/createGame', createGame);
    app.post<{ Params: GameParams }>('/joinGame/:gameId', joinGame);
    app.post<{ Params: GameParams }>('/surrender/:gameId', surrender);
    app.post<{ Params: GameParams }>('/drawRequest/:gameId', drawRequest);
    app.post<{ Params: GameParams, Body: InvitePlayerRequestBody }>('/invitePlayer/:gameId', invitePlayer);
}