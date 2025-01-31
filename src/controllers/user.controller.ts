import prisma from '../utils/prisma';
import { verifyTelegramWebAppData } from '../utils/checker';
import { FastifyReply, FastifyRequest } from 'fastify';
import { EditProfileRequestPayload, changeSettingsRequestPayload, GetUserParams, TelegramUser } from './types';
import { WebSocket } from '@fastify/websocket';
import { usersCache } from '../constants';

export async function getUser(req: FastifyRequest<{Params: GetUserParams}>, reply: FastifyReply) {
    const user = await prisma.user.findUnique({ where: { userId: req.params.id }}); 
    if (!user)
        reply.status(400).send({ message: 'USER_NOT_FOUND' });
    reply.status(200).send({ message: 'COLLECTED', user: user });
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

        reply.status(200).send({ message: 'EDITED' });
    } catch (error: any) {
        reply.status(400).send({ message: error });
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
        reply.status(200).send({ message: 'USER_AUTHORIZED', user: user, accessToken: token });
    } else {
        reply.code(400).send({ message: "INVALID_WEB_APP_INIT_DATA" });
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

        reply.status(200).send({ message: 'EDITED' });
    } catch (error) {
        reply.status(400).send({ message: error });
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

        reply.status(200).send({ message: 'COLLECTED', games: playedGames });
    } catch (error) {
        reply.status(400).send({ message: error });
    }
    
}

export async function getRating(request: FastifyRequest, reply: FastifyReply) {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                scores: 'desc'
            },
            take: 100
        });

        reply.status(200).send({ message: 'COLLECTED', users: users });
    } catch (error) {
        reply.status(400).send({ message: error });
    }
}

export async function onlineWebsocketConnect(socket: WebSocket, request: FastifyRequest) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    
    socket.on("open", () => {  
        usersCache.set(decodedToken.userId, socket)
    })

    socket.on("close", () => {
        usersCache.delete(decodedToken.userId)
    })
}
