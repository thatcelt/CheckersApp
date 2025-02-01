import { FastifyInstance } from 'fastify';
import { createGame, drawRequest, invitePlayer, joinGame, onlineGameWebsocket, searchGame, surrender, botGameWebSocket, createGameWithBot } from '../controllers/game.controller';
import { CreateGameRequestBody, GameParams, GameWebsocketParams, InvitePlayerRequestBody, BotGameWebsocketParams, WebsocketQuery } from '../controllers/types';

export const gameRoutes = (app: FastifyInstance) => {
    app.get<{ Params: GameWebsocketParams }>('/:gameId', { websocket: true }, onlineGameWebsocket);
    app.get<{ Params: BotGameWebsocketParams, Querystring: WebsocketQuery }>('vsBot/:gameId', { websocket: true }, botGameWebSocket);
    app.get('/searchGame', searchGame);
    app.post<{ Body: CreateGameRequestBody }>('/createGame', createGame);
    app.post('/createGameWithBot', createGameWithBot);
    app.post<{ Params: GameParams }>('/joinGame/:gameId', joinGame);
    app.post<{ Params: GameParams }>('/surrender/:gameId', surrender);
    app.post<{ Params: GameParams }>('/drawRequest/:gameId', drawRequest);
    app.post<{ Params: GameParams, Body: InvitePlayerRequestBody }>('/invitePlayer/:gameId', invitePlayer);
}