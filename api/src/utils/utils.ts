import { FastifyReply } from 'fastify';
import { CachedGame, inGameCache, scoresSearchRange } from '../constants';
import { WebSocket } from '@fastify/websocket';


export function gameSendMessages(players: string[], message: string) {
    players.forEach(player => {
        const connectedSocket = inGameCache.get(player)
        if (connectedSocket) connectedSocket.send(message)
    })
}


export function getGameFromSocket(socket: WebSocket, game: CachedGame | undefined, userId: string) {
    if (!game)
        return socket.send(JSON.stringify({ error: 'GAME_IS_NOT_FOUND' })), null;
    if (!game.players.includes(userId))
        return socket.send(JSON.stringify({ error: 'FORBIDDEN' })), null;
    return game;
}

export function getGameFromRequest(reply: FastifyReply, game: CachedGame | undefined, userId: string) {
    if (!game)
        return reply.status(404).send({ message: 'GAME_IS_NOT_FOUND' }), null;
    if (!game.players.includes(userId))
        return reply.status(403).send({ message: 'FORBIDDEN' }), null;
    return game;
}

export const isValidScores = (joiningPlayerScores: number, gameCreatorScores: number) => {
    return Math.max(0, gameCreatorScores - scoresSearchRange) <= joiningPlayerScores && joiningPlayerScores <= gameCreatorScores + scoresSearchRange
}