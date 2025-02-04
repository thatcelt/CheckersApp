import prisma from '../utils/prisma';
import { verifyTelegramWebAppData } from '../utils/checker';
import { FastifyReply, FastifyRequest } from 'fastify';
import { EditProfileRequestPayload, changeSettingsRequestPayload, GetUserParams, TelegramUser, OnlineWebsocketPayload } from './types';
import { WebSocket } from '@fastify/websocket';
import { inGameCache, usersCache } from '../constants';
import app from '../utils/app';

export async function getUser(req: FastifyRequest<{Params: GetUserParams}>, reply: FastifyReply) {
    const decodedToken: {userId: string} = await req.jwtDecode();
    const user = await prisma.user.findUnique({ where: { userId: req.params.id }}); 
    let gameHistory = {}
    
    if (!user)
        return reply.status(400).send({ message: 'USER_NOT_FOUND' });

    if (decodedToken.userId == req.params.id) {
        gameHistory = await prisma.playedGame.findMany({
            where: {
                userId: decodedToken.userId
            }
        })
    }
    return reply.status(200).send({ message: 'COLLECTED', user: user, gameHistory: gameHistory });
}

export async function editProfile(req: EditProfileRequestPayload, reply: FastifyReply) {
    const decodedToken: {userId: string} = await req.jwtDecode();

    try {
        await prisma.user.update({
            where: { userId: decodedToken.userId },
            data: {
                language: req.body.language,
                username: req.body.username,
                profilePicture: req.body.profilePicture,
            }
        });

        return reply.status(200).send({ message: 'EDITED' });
    } catch (error: any) {
        return reply.status(400).send({ message: error });
    }
}

export async function authorize(request: FastifyRequest, reply: FastifyReply) {
    const webData = verifyTelegramWebAppData(request.raw.url?.split("?")[1] || "");

    if (webData[0]) {
        const telegramUser = webData[0] as TelegramUser;
        telegramUser.id = telegramUser.id.toString();

        let user = await prisma.user.findUnique({ where: { userId: telegramUser.id }}); 

        if (!user) {
            user = await prisma.user.create({
                data: {
                    userId: telegramUser.id,
                    username: `${telegramUser.first_name} ${telegramUser.last_name}`,
                    profilePicture: telegramUser.photo_url, 
                    registrationDate: Date.now().toString()
                }
            })
        }

        const token = await reply.jwtSign(user); 
        return reply.status(200).send({ message: 'USER_AUTHORIZED', user: user, accessToken: token });
    } else {
        return reply.code(400).send({ message: "INVALID_WEB_APP_INIT_DATA" });
    }
}

export async function changeSettings(request: changeSettingsRequestPayload, reply: FastifyReply) {
    const decodedToken: {userId: string} = await request.jwtDecode();
    try {
        await prisma.user.update({
            data: {
                possibleMoves: request.query?.possibleMoves,
                vibrationOnTap: request.query?.vibration
            },
            where: {
                userId: decodedToken.userId
            }
        });

        return reply.status(200).send({ message: 'EDITED' });
    } catch (error) {
        return reply.status(400).send({ message: error });
    }
}

export async function getGameHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
        const decodedToken: { userId: string } = await request.jwtDecode();
        const playedGames = await prisma.playedGame.findMany({
            where: {
                userId: decodedToken.userId
            }
        });

        return reply.status(200).send({ message: 'COLLECTED', games: playedGames });
    } catch (error) {
        return reply.status(400).send({ message: error });
    }
    
}

export async function getRating(request: FastifyRequest, reply: FastifyReply) {
    try {
        const decodedToken: { userId: string } = await request.jwtDecode()
        const users = await prisma.user.findMany({
            orderBy: {
                scores: 'desc'
            },
            take: 100
        });
        
        const fullTopUsers = await prisma.user.findMany({
            orderBy: {
                scores: 'desc'
            }
        });

        console.log(fullTopUsers, fullTopUsers.find(user => user.userId == decodedToken.userId))

        const user = fullTopUsers.find(user => user.userId == decodedToken.userId)
        return reply.status(200).send({ message: 'COLLECTED', users: users, user: {userData: user, index: fullTopUsers.indexOf(user!) + 1}});
    } catch (error) {
        return reply.status(400).send({ message: error });
    }
}


export async function onlineWebsocketConnect(socket: WebSocket, request: OnlineWebsocketPayload) {
    const decodedToken: { userId: string } | null = app.jwt.decode(request.query.token);
    if (!decodedToken) {
        socket.close();
        return;
    }
    usersCache.set(decodedToken.userId, socket);

    let lastPingTime = Date.now();

    const checkHeartbeat = () => {
        if (Date.now() - lastPingTime > 60000) { 
            socket.close();
        }
    };

    const heartbeatInterval = setInterval(checkHeartbeat, 30000);

    socket.on('message', (data) => {
        const message = JSON.parse(data.toString());

        if (message.type === 'ping') {
            lastPingTime = Date.now();
            socket.send(JSON.stringify({ type: 'pong' }));
        }
    });

    socket.on('close', () => {
        clearInterval(heartbeatInterval);
        usersCache.delete(decodedToken.userId);
        const gameSocket = inGameCache.get(decodedToken.userId);
        if (gameSocket) gameSocket.close();
    });
}
