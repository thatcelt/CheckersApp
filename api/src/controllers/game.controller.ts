import app from '../utils/app';
import prisma from '../utils/prisma';

import { Bot } from '../utils/bot';
import { v4 as uuidv4 } from 'uuid';
import { Game, Piece, Turn } from '../utils/game';
import { WebSocket } from '@fastify/websocket';
import { FastifyReply, FastifyRequest } from 'fastify';
import { gameSendMessages, getGameFromRequest, getGameFromSocket } from '../utils/utils';
import { drawTimeoutValue, emptyBoard, gamesCache, GameTypes, inGameCache, maxPlayers } from '../constants';
import { acceptDrawRequest, drawGameRequest, invitePlayerRequest, acceptInviteRequest, rejectInviteRequest, makeMove, makeMoveWithBot, searchGameRequest, surrenderGame } from '../services/game.service';
import { CreateGameRequestPayload, GameParams, InvitePlayerRequestBody, OnlineGameWebsocketMessage, BotGameWebsocketMessage, GameWebsocketPayload, CreateGameWithBotRequestPayload } from './types';

export async function createGame(request: CreateGameRequestPayload, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    if (inGameCache.has(decodedToken.userId)) return reply.status(400).send({ message: 'YOU_ALREADY_IN_GAME' });
    
    const createdGame = new Game(emptyBoard);
    const gameId = uuidv4();
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            userId: decodedToken.userId
        }
    });

    gamesCache.set(gameId, {gameId: gameId, players: [decodedToken.userId], game: createdGame, drawTime: 0, gameType: request.body.gameType, creatorScores: userData.scores});
    return reply.code(200).send({ message: 'GAME_CREATED', gameId: gameId });
}

export async function createGameWithBot(request: CreateGameWithBotRequestPayload, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    if (inGameCache.has(decodedToken.userId)) return reply.status(400).send({ message: 'YOU_ALREADY_IN_GAME' });
    
    const createdGame = new Game(emptyBoard);
    const gameId = uuidv4();
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            userId: decodedToken.userId
        }
    });

    gamesCache.set(gameId, { gameId: gameId, players: [decodedToken.userId, 'bot'], game: createdGame, drawTime: 0, gameType: GameTypes.PRIVATE, creatorScores: userData.scores, bot: new Bot(request.body.difficulty) });
    return reply.code(200).send({ message: 'GAME_CREATED', gameId: gameId });
}

export async function createGameOnOneDevice(request: FastifyRequest, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode(); 
    if (inGameCache.has(decodedToken.userId)) return reply.status(400).send({ message: 'YOU_ALREADY_IN_GAME' });

    const createdGame = new Game(emptyBoard);
    const gameId = uuidv4();

    gamesCache.set(gameId, { gameId: gameId, players: [decodedToken.userId, 'nothing'], game: createdGame, drawTime: 0, gameType: GameTypes.PRIVATE, creatorScores: 0 });
    return reply.code(200).send({ message: 'GAME_CREATED', gameId: gameId });
}

export async function joinGame(request: FastifyRequest<{ Params: GameParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    if (inGameCache.has(decodedToken.userId)) return reply.status(400).send({message: 'YOU_ALREADY_IN_GAME'});

    const game = gamesCache.get(request.params.gameId)

    if (!game) {
        return reply.status(404).send({message: 'GAME_IS_NOT_FOUND'})
    }

    if (game.players.includes(decodedToken.userId)) return reply.code(403).send({ message: 'FORBIDDEN' })

    if (game.players.length == maxPlayers) return reply.status(400).send({message: 'GAME_IS_FULL' });
    
    game.players.push(decodedToken.userId);
    const playerData = await prisma.user.findUnique({ where: { userId: game?.players[0] } });
    const joinedPlayerData = await prisma.user.findUnique({ where: { userId: game?.players[1] } });

    reply.code(200).send({message: 'JOINED_IN_GAME', game: {
        board: game.game.board,
        possibleMoves: game.game.getAllValidMoves(Piece.WHITE_PIECE),
        players: [
            {
                profilePicture: playerData?.profilePicture,
                username: playerData?.username
            },
            {
                profilePicture: joinedPlayerData?.profilePicture,
                username: joinedPlayerData?.username
            }
        ]
    }});
}

export async function searchGame(request: FastifyRequest, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    if (inGameCache.has(decodedToken.userId)) return reply.status(400).send({message: 'YOU_ALREADY_IN_GAME'});
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            userId: decodedToken.userId
        }
    });

    searchGameRequest(reply, decodedToken.userId, userData.scores);
}

export async function surrender(request: FastifyRequest<{ Params: GameParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    const game = getGameFromRequest(reply, gamesCache.get(request.params.gameId), decodedToken.userId);
    if (!game?.players.includes('nothing')) {
        await surrenderGame(game!, decodedToken.userId);
    }
    return reply.code(200).send({ message: 'GAME_IS_SURRENDERED' });
}

export async function drawRequest(request: FastifyRequest<{ Params: GameParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    const game = getGameFromRequest(reply, gamesCache.get(request.params.gameId), decodedToken.userId)

    if (Date.now() - game!.drawTime < drawTimeoutValue)
        return reply.code(408).send({ message: 'DRAW_TIMEOUT' });

    const recipientId = game!.players.filter(player => player != decodedToken.userId)
    if (!recipientId || recipientId.length == 0)
        return reply.code(404).send({ message: 'RECIPIENT_IS_NOT_FOUND' });
    
    await drawGameRequest(game!, decodedToken.userId, recipientId[0]);
    return reply.code(200).send({ message: 'DRAW_REQUESTED' });
}

export async function invitePlayer(request: FastifyRequest<{ Params: GameParams, Body: InvitePlayerRequestBody }>, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    const game = getGameFromRequest(reply, gamesCache.get(request.params.gameId), decodedToken.userId);

    if (game!.gameType != 'private') 
        return reply.status(403).send({ message: 'FORBIDDEN' });
    if (game!.players.length == maxPlayers) 
        return reply.status(400).send({ message: 'GAME_IS_FULL' });

    await invitePlayerRequest(reply, game!, decodedToken.userId, request.body.playerId);
    return reply.code(200).send({ message: 'INVITE_REQUESTED' });
}

export async function acceptInvite(request: FastifyRequest<{ Params: GameParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    const game = getGameFromRequest(reply, gamesCache.get(request.params.gameId), decodedToken.userId)
    if (!game || game.gameType != 'private') 
        return reply.status(403).send({ message: 'FORBIDDEN' });
    if (game.players.length == maxPlayers) 
        return reply.status(400).send({ message: 'GAME_IS_FULL' });

    acceptInviteRequest(reply, game, decodedToken.userId);
    return reply.code(200).send({ message: 'INVITE_ACCEPTED' });
}

export async function rejectInvite(request: FastifyRequest<{ Params: GameParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    const game = getGameFromRequest(reply, gamesCache.get(request.params.gameId), decodedToken.userId)
    if (!game || game.gameType != 'private') 
        return reply.status(403).send({ message: 'FORBIDDEN' });
    if (game.players.length == maxPlayers) 
        return reply.status(400).send({ message: 'GAME_IS_FULL' });

    rejectInviteRequest(reply, game, decodedToken.userId);
    return reply.code(200).send({ message: 'INVITE_DECLINED' });
}

export async function onlineGameWebsocket(socket: WebSocket, request: GameWebsocketPayload) {
    const decodedToken: { userId: string } | null = app.jwt.decode(request.query.token);
    if (!decodedToken) {
        socket.close();
        return;
    }
    const game = gamesCache.get(request.query.gameId);
    inGameCache.set(decodedToken.userId, socket);
    
    if (game?.players.length == maxPlayers) {
        const playerData = await prisma.user.findUnique({ where: { userId: game?.players[0] } });
        const joinedPlayerData = await prisma.user.findUnique({ where: { userId: game?.players[1] } });

        gameSendMessages(game.players, JSON.stringify({
            t: 'NEXT_MOVE',
            board: game?.game.board,
            possibleMoves: game?.game.getAllValidMoves(Piece.WHITE_PIECE),
            currentTurn: game?.game.currentTurn,
            players: [
                {
                    profilePicture: playerData?.profilePicture,
                    username: playerData?.username
                },
                {
                    profilePicture: joinedPlayerData?.profilePicture,
                    username: joinedPlayerData?.username
                }
            ]
        }))
    }

    socket.on('close', async () => {
        if (game && !game.winner)
            await surrenderGame(game, decodedToken.userId)
    });

    socket.on('message', async message => {
        let parsedMessage: OnlineGameWebsocketMessage;

        try {
            parsedMessage = JSON.parse(message.toString());
        } catch (error) {
            socket.send(JSON.stringify({ error: 'PARSING_ERROR' }));
            socket.close();
            return;
        }
        const game = getGameFromSocket(socket, gamesCache.get(request.query.gameId), decodedToken.userId);
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
    });
}

export async function botGameWebSocket(socket: WebSocket, request: GameWebsocketPayload) {
    const decodedToken: { userId: string } | null = app.jwt.decode(request.query.token);
    if (!decodedToken) {
        socket.close();
        return;
    }

    const game = gamesCache.get(request.query.gameId);
    inGameCache.set(decodedToken.userId, socket);

    socket.send(JSON.stringify({
        t: 'NEXT_MOVE',
        board: game?.game.board,
        currentTurn: game?.game.currentTurn,
        possibleMoves: game?.game.getAllValidMoves(Piece.WHITE_PIECE)
    }));

    socket.on('close', () => {
        inGameCache.delete(decodedToken.userId);
        gamesCache.delete(request.query.gameId);
    });

    socket.on('message', async message => {
        let parsedMessage: BotGameWebsocketMessage;

        try {
            parsedMessage = JSON.parse(message.toString());
        } catch (error) {
            socket.send(JSON.stringify({ error: 'PARSING_ERROR' }));
            socket.close();
            return;
        }

        const game = getGameFromSocket(socket, gamesCache.get(request.query.gameId), decodedToken.userId);
        if (!game) {
            socket.close();
            return;
        }

        switch (parsedMessage.action) {
            case 'MOVE': {
                await makeMove(socket, game, parsedMessage, decodedToken.userId);
                setTimeout(async () => await makeMoveWithBot(socket, game, parsedMessage, decodedToken.userId), 1000);
                break;
            }
            
            case 'ACCEPT_DRAW': {
                await acceptDrawRequest(game, decodedToken.userId);
                break;
            }
        }
    })
}

export async function onOneDeviceGameWebSocket(socket: WebSocket, request: GameWebsocketPayload) {
    const decodedToken: { userId: string } | null = app.jwt.decode(request.query.token);
    if (!decodedToken) {
        socket.close();
        return;
    }

    const game = gamesCache.get(request.query.gameId);
    inGameCache.set(decodedToken.userId, socket);

    socket.send(JSON.stringify({
        t: 'NEXT_MOVE',
        board: game?.game.board,
        currentTurn: game?.game.currentTurn,
        possibleMoves: game?.game.getAllValidMoves(game.game.currentTurn == Turn.Black ? Piece.BLACK_PIECE : Piece.WHITE_PIECE)
    }));

    socket.on('close', () => {
        inGameCache.delete(decodedToken.userId);
        gamesCache.delete(request.query.gameId);
    })

    socket.on('message', async message => {
        let parsedMessage: OnlineGameWebsocketMessage

        try {
            parsedMessage = JSON.parse(message.toString());
        } catch (error) {
            socket.send(JSON.stringify({ error: 'PARSING_ERROR' }));
            socket.close();
            return;
        }

        const game = getGameFromSocket(socket, gamesCache.get(request.query.gameId), decodedToken.userId);
        if (!game) {
            socket.close();
            return;
        }

        switch (parsedMessage.action) {
            case 'MOVE': {
                await makeMove(socket, game, parsedMessage, decodedToken.userId);
                break;
            }
        }
    })
}