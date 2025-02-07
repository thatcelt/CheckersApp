import { FastifyInstance } from 'fastify';
import { createGame, drawRequest, invitePlayer, joinGame, onlineGameWebsocket, searchGame, surrender, botGameWebSocket, createGameWithBot, onOneDeviceGameWebSocket, createGameOnOneDevice, acceptInvite, rejectInvite } from '../controllers/game.controller';
import { CreateGameRequestBody, GameParams, GameWebsocketParams, InvitePlayerRequestBody, BotGameWebsocketParams, WebsocketQuery, CreateGameWithBotRequestBody } from '../controllers/types';

export const gameRoutes = (app: FastifyInstance) => {
    app.get<{ Querystring: GameWebsocketParams }>('/', { websocket: true }, onlineGameWebsocket);
    app.get<{ Querystring: GameWebsocketParams }>('/vsBot', { websocket: true }, botGameWebSocket);
    app.get<{ Querystring: GameWebsocketParams }>('/oneDevice', { websocket: true }, onOneDeviceGameWebSocket)
    app.get('/searchGame', searchGame);
    app.post<{ Body: CreateGameRequestBody }>('/createGame', createGame);
    app.post<{ Body: CreateGameWithBotRequestBody }>('/createGameWithBot', createGameWithBot);
    app.post('/createGameOnOneDevice', createGameOnOneDevice)
    app.post<{ Params: GameParams }>('/joinGame/:gameId', joinGame);
    app.post<{ Params: GameParams }>('/surrender/:gameId', surrender);
    app.post<{ Params: GameParams }>('/drawRequest/:gameId', drawRequest);
    app.post<{ Body: InvitePlayerRequestBody }>('/invitePlayer', invitePlayer);
    app.post<{ Params: GameParams }>('/acceptInvite/:gameId', acceptInvite);
    app.post<{ Params: GameParams }>('/rejectInvite/:gameId', rejectInvite);
}