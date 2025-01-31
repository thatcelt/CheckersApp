import prisma from "../utils/prisma";
import { FriendParams } from "./types";
import { FastifyReply, FastifyRequest } from "fastify";


export async function addFriend(request: FastifyRequest<{ Params: FriendParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();

    await prisma.friendship.create({
        data: {
            userId: decodedToken.userId,
            friendId: request.params.id
        }
    }); 

    reply.status(200).send({ message: "FRIEND_ADDED" });
}

export async function removeFriend(request: FastifyRequest<{ Params: FriendParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    
    try {
        await prisma.friendship.delete({
            where: {
                userId_friendId: {
                    userId: decodedToken.userId,
                    friendId: request.params.id
                }
            }
        });
        reply.status(200).send({ message: "FRIEND_REMOVED" });
    } catch (error: any) {
        reply.status(400).send({ message: error });
    }
}

export async function getFriends(request: FastifyRequest, reply: FastifyReply) {
    const decodedToken: { userId: string} = await request.jwtDecode();
    const friends = await prisma.friendship.findMany({ where: { userId: decodedToken.userId }});

    reply.status(200).send({ message: "FRIENDS_COLLECTED", friends: friends });
}

