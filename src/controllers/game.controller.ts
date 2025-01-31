import { FastifyReply, FastifyRequest } from 'fastify';
import { drawTimeoutValue, emptyBoard, gamesCache, inGameCache, maxPlayers } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { CreateGameRequestPayload, GameParams, InvitePlayerRequestBody, OnlineGameWebsocketMessage } from './types';
import { Game, Piece } from '../utils/game';
import { WebSocket } from "@fastify/websocket"
import { acceptDrawRequest, drawGameRequest, invitePlayerRequest, makeMove, searchGameRequest, surrenderGame } from '../services/game.service';
import { getGameFromRequest, getGameFromSocket } from '../utils/utils';
import prisma from '../utils/prisma';

export async function createGame(request: CreateGameRequestPayload, reply: FastifyReply) {
    const decodedToken: { userId: string} = await request.jwtDecode();
    if (inGameCache.has(decodedToken.userId)) reply.status(400).send({ message: 'YOU_ALREADY_IN_GAME' });
    
    const createdGame = new Game(emptyBoard);
    const gameId = uuidv4();
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            userId: decodedToken.userId
        }
    })

    gamesCache.set(gameId, {gameId: gameId, players: [decodedToken.userId], game: createdGame, drawTime: 0, gameType: request.body.gameType, creatorScores: userData.scores});
    reply.code(200).send({message: 'GAME_CREATED', gameId: gameId});
}

export async function joinGame(request: FastifyRequest<{ Params: GameParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string} = await request.jwtDecode();
    if (inGameCache.has(decodedToken.userId)) reply.status(400).send({message: 'YOU_ALREADY_IN_GAME'});

    const game = gamesCache.get(request.params.gameId)

    if (!game) {
        reply.status(404).send({message: 'GAME_IS_NOT_FOUND'})
        return;
    }

    if (game.players.length == maxPlayers) reply.status(400).send({message: 'GAME_IS_FULL' });
    
    game.players.push(decodedToken.userId);
    const playerData = await prisma.user.findUniqueOrThrow({ where: { userId: game?.players[0] } });
    const joinedPlayerData = await prisma.user.findUniqueOrThrow({ where: { userId: game?.players[1] } });

    reply.code(200).send({message: 'JOINED_IN_GAME', game: {
        board: game.game.board,
        possibleMoves: game.game.getAllValidMoves(Piece.WHITE_PIECE),
        player: {
            profilePicture: playerData.profilePicture,
            username: playerData.username
        }
    }});
    
    const connectedSocket = inGameCache.get(game.players[0])
    if (connectedSocket) connectedSocket.send(JSON.stringify({
        t: 'PLAYER_JOINED',
        player: {
            profilePicture: joinedPlayerData.profilePicture,
            username: joinedPlayerData.username
        }
    }));

}

export async function searchGame(request: FastifyRequest, reply: FastifyReply) {
    const decodedToken: { userId: string} = await request.jwtDecode();
    if (inGameCache.has(decodedToken.userId)) reply.status(400).send({message: 'YOU_ALREADY_IN_GAME'});
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            userId: decodedToken.userId
        }
    });

    searchGameRequest(reply, decodedToken.userId, userData.scores);
}

export async function surrender(request: FastifyRequest<{ Params: GameParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string} = await request.jwtDecode();
    const game = getGameFromRequest(reply, gamesCache.get(request.params.gameId), decodedToken.userId);

    await surrenderGame(game!, decodedToken.userId);
    reply.code(200).send({ message: 'GAME_IS_SURRENDERED' });
}

export async function drawRequest(request: FastifyRequest<{ Params: GameParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string} = await request.jwtDecode();
    const game = getGameFromRequest(reply, gamesCache.get(request.params.gameId), decodedToken.userId)

    if (Date.now() - game!.drawTime < drawTimeoutValue)
        reply.code(408).send({ message: 'DRAW_TIMEOUT' });

    const recipientId = game!.players.filter(player => player != decodedToken.userId)
    if (!recipientId || recipientId.length == 0)
        reply.code(404).send({ message: 'RECIPIENT_IS_NOT_FOUND' });
    
    await drawGameRequest(game!, decodedToken.userId, recipientId[0]);
    reply.code(200).send({ message: 'DRAW_REQUESTED' });
}

export async function invitePlayer(request: FastifyRequest<{ Params: GameParams, Body: InvitePlayerRequestBody }>, reply: FastifyReply) {
    const decodedToken: { userId: string} = await request.jwtDecode();
    const game = getGameFromRequest(reply, gamesCache.get(request.params.gameId), decodedToken.userId);

    if (game!.gameType != 'private') 
        reply.status(403).send({ message: 'FORBIDDEN' });
    if (game!.players.length == maxPlayers) 
        reply.status(400).send({ message: 'GAME_IS_FULL' });

    await invitePlayerRequest(reply, game!, decodedToken.userId, request.body.playerId);
    reply.code(200).send({ message: 'INVITE_REQUESTED' });
}

export async function onlineGameWebsocket(socket: WebSocket, request: FastifyRequest<{ Params: GameParams }>) {
    const decodedToken: { userId: string} = await request.jwtDecode();

    socket.on('open', () => inGameCache.set(decodedToken.userId, socket));

    socket.on('message', async message => {
        let parsedMessage: OnlineGameWebsocketMessage;

        try {
            parsedMessage = JSON.parse(message.toString());
        } catch (error) {
            socket.send(JSON.stringify({ error: 'PARSING_ERROR' }));
            socket.close();
            return;
        }
        const game = getGameFromSocket(socket, gamesCache.get(request.params.gameId), decodedToken.userId);
        if (!game) {
            socket.close();
            return;
        }

        switch (parsedMessage.action) {
            case 'MOVE': {
                await makeMove(socket, game, parsedMessage, decodedToken.userId);
                break
            }
            
            case 'ACCEPT_DRAW': {
                await acceptDrawRequest(game, decodedToken.userId);
                break
            }
        }
    })
}