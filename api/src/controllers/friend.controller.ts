import { usersCache } from '../constants';
import prisma from '../utils/prisma';
import { FriendParams, GetFriendRequestParams } from './types';
import { FastifyReply, FastifyRequest } from 'fastify';


export async function addFriend(request: FastifyRequest<{ Params: FriendParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();

    await prisma.friendship.create({
        data: {
            userId: decodedToken.userId,
            friendId: request.params.id
        }
    }); 

    return reply.status(200).send({ message: 'FRIEND_ADDED' });
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
        return reply.status(200).send({ message: 'FRIEND_REMOVED' });
    } catch (error: any) {
        return reply.status(400).send({ message: error });
    }
}

export async function getFriends(request: FastifyRequest<{ Params: GetFriendRequestParams }>, reply: FastifyReply) {
    const decodedToken: { userId: string } = await request.jwtDecode();
    let friendships = await prisma.friendship.findMany({
        include: {
            user: true,
            friend: true
        },
        where: {
            OR: [
                { userId: decodedToken.userId },
                { friendId: decodedToken.userId }
            ]
        }
    });

    let filtered = [];
    const friends = friendships.map(friendship => friendship.friend.userId == decodedToken.userId ? friendship.user : friendship.friend);
    if (request.params.state == 'active')
        filtered = friends.filter(friend => usersCache.has(friend.userId));
    else
        filtered = friends.filter(friend => !usersCache.has(friend.userId));

    return reply.status(200).send({ message: 'FRIENDS_COLLECTED', friends: filtered });
}

