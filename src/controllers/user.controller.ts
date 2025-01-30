import prisma from '../utils/prisma';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthorizeRequestPayload, RegisterRequestPayload, EditProfileRequestPayload, changeSettingsRequestPayload, GetUserParams } from './types';

export async function registration(req: RegisterRequestPayload, reply: FastifyReply) {
    if (await prisma.user.findUnique({ where: { userId: req.body.userId }})) {
        reply.code(400).send({ message: "USER_EXIST" }); 
    }

    const newUser = await prisma.user.create({
        data: {
            userId: req.body.userId,
            username: req.body.username,
            profilePicture: req.body.profilePicture,
            registrationDate: new Date().valueOf().toString()
        }
    })
    const createdToken = await reply.jwtSign({userId: req.body.userId})

    reply.status(200).send({ message: "USER_CREATED", user: newUser, accesToken: createdToken});
}

export async function getUser(req: FastifyRequest<{Params: GetUserParams}>, reply: FastifyReply) {
    const user = await prisma.user.findUnique({ where: { userId: req.params.id }}); 
    if (!user) {
        reply.status(400).send({ message: "USER_NOT_FOUND" });
    }

    reply.status(200).send({ message: "COLLECTED", user: user });
}

// TODO: parse id from token
export async function editProfile(req: EditProfileRequestPayload, reply: FastifyReply) {
    const decodedToken: {userId: number} = await req.jwtDecode();

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

export async function authorize(request: AuthorizeRequestPayload, reply: FastifyReply) {
    try {
        const decodedToken: {userId: number} = await request.jwtDecode();
        const user = await prisma.user.findUnique({ where: { userId: decodedToken.userId }});
        reply.status(200).send({ message: 'AUTHORIZED', user: user});
    } catch (error: any) {
        reply.status(400).send({ message: error });
    }
}

export async function changeSettings(request: changeSettingsRequestPayload, reply: FastifyReply) {
    const decodedToken: {userId: number} = await request.jwtDecode();
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
        const decodedToken: {userId: number} = await request.jwtDecode();

        const playedGames = await prisma.playedGame.findMany({
            where: {
                userId: decodedToken.userId
            }
        })
        reply.status(200).send({message: "COLLECTED", games: playedGames})
    } catch (error) {
        reply.status(400).send({ message: error });
    }
    
}