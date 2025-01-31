import { FastifyInstance } from 'fastify';
import { onlineGameWebsocket } from '../controllers/game.controller';
import { GameParams } from '../controllers/types';

export const gameRoutes = (app: FastifyInstance) => {
    app.get<{ Params: GameParams }>('/:gameId', { websocket: true }, onlineGameWebsocket);
}