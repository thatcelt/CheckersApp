import { CachedGame, drawTimeoutValue, emptyBoard, gamesCache, inGameCache, maxPlayers, playerPlaces, Turn, usersCache } from '../constants';
import { WebSocket } from '@fastify/websocket';
import { OnlineGameWebsocketMessage } from '../controllers/types';
import { gameSendMessages, isValidScores } from '../utils/utils';
import { Piece } from '../utils/getCaptures';
import prisma from '../utils/prisma';
import { FastifyReply } from 'fastify';
import { Game } from '../utils/game';
import { Bot } from '../utils/bot';
import { v4 as uuidv4 } from 'uuid';


export async function setGameResults(gameId: string, players: string[], winnerId: string, isDrawed: boolean) {
    players.forEach(async player => {
        const connectedSocket = inGameCache.get(player)
        if (connectedSocket) {
            connectedSocket.close();

            await prisma.playedGame.create({
                data: {
                    playedGameId: gameId,
                    playedDate: Date.now(),
                    status: winnerId == player ? 'WIN' : isDrawed ? 'DRAW' : 'LOSS',
                    userId: player
                }
            });

            if (!isDrawed) {
                const userData = await prisma.user.findUniqueOrThrow({where: { userId: player }});

                await prisma.user.update({
                    data: {
                        scores: winnerId == player ? {
                            increment: 10
                        } : Math.max(0, userData.scores - 8)
                    },
                    where: {
                        userId: player
                    }
                })
            }
        }

        inGameCache.delete(player);
        gamesCache.delete(gameId);
    })
}

export async function makeMove(socket: WebSocket, game: CachedGame, websocketMessage: OnlineGameWebsocketMessage, userId: string) {
    if (!websocketMessage.move)
        return socket.send(JSON.stringify({ error: 'INVALID_MOVE' }));

    if (game.players.indexOf(userId) + 1 != game.game.currentTurn)
        return socket.send(JSON.stringify({ error: 'NOT_YOUR_TURN' }));

    if (!game.game.getValidMoves(websocketMessage.move[0][0], websocketMessage.move[0][1]).includes(websocketMessage.move[1]))
        return socket.send(JSON.stringify({ error: 'INVALID_MOVE' }));

    game.game.movePiece(websocketMessage.move[0], websocketMessage.move[1]);
    game.game.currentTurn = game.game.currentTurn == Turn.Black ? Turn.White : Turn.Black;

    const checkedWinner = game.game.checkForWinner();
    if (checkedWinner) {
        game.winner = checkedWinner;
        game.reason = checkedWinner == 'White' ? 'YOUR_OPPONENT_NO_POSSIBLE_MOVES_LEFT' : 'AI_YOU_ARE_NO_POSSIBLE_MOVES';
    }

    gameSendMessages(game.players, JSON.stringify({
        move: websocketMessage.move,
        moverId: userId
    }));

    gameSendMessages(game.players, JSON.stringify({
        board: game.game.board,
        possibleMoves: game.game.getAllValidMoves(game.game.currentTurn == Turn.Black ? Piece.BLACK_PIECE : Piece.WHITE_PIECE),
        winner: game.winner,
        reason: game.reason
    }));

    gamesCache.set(game.gameId, game);

    if (checkedWinner) {
        const playerPlace = playerPlaces.get(checkedWinner);
        if (playerPlace) await setGameResults(game.gameId, game.players, game.players[playerPlace], false);
    }
}

export async function makeMoveWithBot(socket: WebSocket, game: CachedGame, websocketMessage: OnlineGameWebsocketMessage, userId: string) {
    if (game.game.currentTurn != Turn.Black)
        return;

    while (game.game.currentTurn == Turn.Black) {
        const moves = await (async () => {})();

        // @ts-ignore
        if (moves) {
            socket.send(JSON.stringify({
                move: [[0, 0], [0, 0]],
                moverId: 'bot'
            }));

            // @ts-ignore
            game.game.movePiece(0, 0);
            game.game.currentTurn = game.game.currentTurn == Turn.Black ? Turn.White : Turn.Black;
        }
    }
}

export async function surrenderGame(game: CachedGame, surrenderer: string) {
    const checkedWinner = game.players.indexOf(surrenderer) + 1 == 1 ? 'Black' : 'White';

    gameSendMessages(game.players, JSON.stringify({
        winner: checkedWinner,
        reason: 'PLAYER_SURRENDERED'
    }));

    const playerPlace = playerPlaces.get(checkedWinner);
    if (playerPlace) await setGameResults(game.gameId, game.players, game.players[playerPlace], false);
}

export async function drawGameRequest(game: CachedGame, requesterId: string, receipientId: string) {
    game.drawTime = Date.now();
    game.drawRequesterId = requesterId
    gamesCache.set(game.gameId, game);

    const connectedSocket = inGameCache.get(receipientId)
    if (connectedSocket)
        connectedSocket.send(JSON.stringify({ t: 'DRAW_REQUESTED' }));
}

export async function acceptDrawRequest(game: CachedGame, accepterId: string) {
    const connectedSocket = inGameCache.get(accepterId)
    if (!connectedSocket) return
    
    if (game.drawRequesterId == accepterId)
        connectedSocket.send(JSON.stringify({ t: 'FORBIDDEN' }));
    if (Date.now() - game.drawTime > drawTimeoutValue)
        connectedSocket.send(JSON.stringify({ t: 'DRAW_TIMEOUT' }));

    gameSendMessages(game.players, JSON.stringify({
        winner: 'Draw',
        reason: 'GAME_WAS_DRAWED'
    }));
    
    const drawResult = playerPlaces.get('Draw')?.toString();
    if (drawResult) await setGameResults(game.gameId, game.players, drawResult, true);
}

export async function invitePlayerRequest(reply: FastifyReply, game: CachedGame, inviterId: string, playerId: string) {
    try {
        await prisma.friendship.findFirstOrThrow({
            where: {
                OR: [
                    { friendId: inviterId, userId: playerId },
                    { friendId: playerId, userId: inviterId }
                ]
            }
        });

        if (!inGameCache.get(playerId))
            reply.code(400).send({ message: 'FRIEND_ALREADY_IN_GAME' });

        const onlineSocket = usersCache.get(playerId)
        if (!onlineSocket)
            reply.code(400).send({ message: 'FRIEND_IS_OFFLINE' })

        onlineSocket?.send(JSON.stringify({
            t: 'INVITE',
            gameId: game.gameId,
            inviterId: inviterId
        }));
        
    } catch (error) {
        reply.code(403).send({ message: 'FORBIDDEN' });
    }
}

export async function searchGameRequest(reply: FastifyReply, userId: string, joiningPlayerScores: number) {
    const filteredGame = [...gamesCache.values()].find(game => game.players.length < maxPlayers && isValidScores(joiningPlayerScores, game.creatorScores));
    if (filteredGame) reply.status(200).send({ message: 'GAME_IS_FOUND', gameId: filteredGame.gameId });

    const createdGame = new Game(emptyBoard);
    const gameId = uuidv4();

    gamesCache.set(gameId, { gameId: gameId, players: [userId], game: createdGame, drawTime: 0, gameType: 'public', creatorScores: joiningPlayerScores });
    reply.code(200).send({message: 'GAME_CREATED', gameId: gameId});
}