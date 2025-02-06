import { CachedGame, drawTimeoutValue, emptyBoard, gamesCache, inGameCache, maxPlayers, playerPlaces, Turn, usersCache } from '../constants';
import { WebSocket } from '@fastify/websocket';
import { OnlineGameWebsocketMessage } from '../controllers/types';
import { gameSendMessages, isValidScores } from '../utils/utils';
import { Piece } from '../utils/game';
import prisma from '../utils/prisma';
import { FastifyReply } from 'fastify';
import { Game } from '../utils/game';
import { v4 as uuidv4 } from 'uuid';


export async function setGameResults(gameId: string, players: string[], winnerId: string, isDrawed: boolean) {
    players.forEach(async player => {
        const connectedSocket = inGameCache.get(player)
        if (connectedSocket) {
            connectedSocket.close();
        
            await prisma.playedGame.create({
                data: {
                    playedGameId: gameId,
                    playedDate: Date.now().toString(),
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

    if (game.players.indexOf(userId) + 1 != game.game.currentTurn && !game.players.includes('nothing'))
        return socket.send(JSON.stringify({ error: 'NOT_YOUR_TURN' }));

    const validMoves = game.game.getValidMoves(websocketMessage.move[0][0], websocketMessage.move[0][1]);
    const exists = validMoves.some(arr => 
        arr.length === websocketMessage.move![1]!.length && arr.every((val, index) => val === websocketMessage.move![1]![index])
    );

    if (!exists)
        return socket.send(JSON.stringify({ error: 'INVALID_MOVE' }));

    game.game.movePiece(websocketMessage.move[0], websocketMessage.move[1]);

    const checkedWinner = game.game.checkForWinner();

    if (checkedWinner) {
        game.winner = checkedWinner;
        game.reason = checkedWinner == 'White' ? 'YOUR_OPPONENT_NO_POSSIBLE_MOVES_LEFT' : 'AI_YOU_ARE_NO_POSSIBLE_MOVES';
    }

    gameSendMessages(game.players, JSON.stringify({
        t: 'CURRENT_MOVE',
        move: websocketMessage.move,
        moverId: userId
    }));

    gameSendMessages(game.players, JSON.stringify({
        t: 'NEXT_MOVE',
        currentTurn: game?.game.currentTurn,
        board: game.game.board,
        possibleMoves: game.game.getAllValidMoves(game.game.currentTurn == Turn.Black ? Piece.BLACK_PIECE : Piece.WHITE_PIECE),
        winner: game.winner,
        reason: game.reason
    }));

    if (checkedWinner && game.players[1] != 'nothing') {
        const playerPlace = playerPlaces.get(checkedWinner);
        await setGameResults(game.gameId, game.players, game.players[playerPlace!], false);
    } else if (checkedWinner && game.players[1] == 'nothing') {
        socket.close()
    }
}

export async function makeMoveWithBot(socket: WebSocket, game: CachedGame, websocketMessage: OnlineGameWebsocketMessage, userId: string) {
    if (game.game.currentTurn != Turn.Black)
        return;

    const result = game.bot!.getMove(game.game);
    if (result) {
        socket.send(JSON.stringify({
            t: 'CURRENT_MOVE',
            move: [result[0], result[1]],
            moverId: 'bot'
        }));

        game.game.movePiece(result[0], result[1]);
        await new Promise(resolve => setTimeout(() => resolve(true), 1000));
        while (game.game.capturingPiece && game.game.mustCapture) {
            
            const nextMoves = game.game.getValidMoves(game.game.capturingPiece[0], game.game.capturingPiece[1], true);
            if (nextMoves) {
                const move = nextMoves[Math.floor(Math.random() * nextMoves.length)];

                socket.send(JSON.stringify({
                    t: 'CURRENT_MOVE',
                    move: [game.game.capturingPiece, move ],
                    moverId: 'bot'
                }));
        
                game.game.movePiece(game.game.capturingPiece, move);
            }
        }
    }

    const checkedWinner = game.game.checkForWinner();
    if (checkedWinner) {
        game.winner = checkedWinner;
        game.reason = checkedWinner == 'White' ? 'YOUR_OPPONENT_NO_POSSIBLE_MOVES_LEFT' : 'AI_YOU_ARE_NO_POSSIBLE_MOVES';
    }

    gameSendMessages(game.players, JSON.stringify({
        t: 'NEXT_MOVE',
        board: game.game.board,
        possibleMoves: game.game.getAllValidMoves(game.game.currentTurn == Turn.Black ? Piece.BLACK_PIECE : Piece.WHITE_PIECE),
        winner: game.winner,
        reason: game.reason,
        currentTurn: game.game.currentTurn
    }));

    gamesCache.set(game.gameId, game);

    if (checkedWinner) {
        inGameCache.delete(game.players[0]);
        gamesCache.delete(game.gameId);
        socket.close()
    }
}

export async function surrenderGame(game: CachedGame, surrenderer: string) {
    if (!game) return
    if (game.players.length < 2) return
    const checkedWinner = game.players.indexOf(surrenderer) + 1 == 1 ? 'BLACK' : 'WHITE';

    gameSendMessages(game.players, JSON.stringify({
        t: 'SURRENDER',
        winner: checkedWinner,
        reason: 'PLAYER_SURRENDERED'
    }));

    const playerPlace = playerPlaces.get(checkedWinner);
    if (!game.players.includes('bot')) {
        await setGameResults(game.gameId, game.players, game.players[playerPlace!], false);
    } else {
        game.players.map(player => player !== 'bot' && inGameCache.delete(player));
        gamesCache.delete(game.gameId);
    }
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
        t: 'DRAW',
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
            return reply.code(400).send({ message: 'FRIEND_ALREADY_IN_GAME' });

        const onlineSocket = usersCache.get(playerId)
        if (!onlineSocket)
            return reply.code(400).send({ message: 'FRIEND_IS_OFFLINE' })

        onlineSocket?.send(JSON.stringify({
            t: 'INVITE',
            gameId: game.gameId,
            inviterId: inviterId
        }));
        
    } catch (error) {
        return reply.code(403).send({ message: 'FORBIDDEN' });
    }
}

export async function searchGameRequest(reply: FastifyReply, userId: string, joiningPlayerScores: number) {
    const filteredGame = [...gamesCache.values()].find(game => game.players.length < maxPlayers && isValidScores(joiningPlayerScores, game.creatorScores));
    if (filteredGame) return reply.status(200).send({ message: 'GAME_IS_FOUND', gameId: filteredGame.gameId });

    const createdGame = new Game(emptyBoard);
    const gameId = uuidv4();

    gamesCache.set(gameId, { gameId: gameId, players: [userId], game: createdGame, drawTime: 0, gameType: 'public', creatorScores: joiningPlayerScores });
    return reply.code(200).send({message: 'GAME_CREATED', gameId: gameId, players: [userId]});
}