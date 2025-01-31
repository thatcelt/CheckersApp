import { FastifyInstance } from "fastify";
import { FriendParams } from "../controllers/types";
import { addFriend, removeFriend, getFriends } from "../controllers/friend.controller";

export const friendRoutes = (app: FastifyInstance) => {
    app.get('/getFriends', { preHandler: [app.authenticate] }, getFriends);
    app.post<{ Params: FriendParams }>('/addFriend/:id', { preHandler: [app.authenticate] }, addFriend);
    app.delete<{ Params: FriendParams }>('/removeFriend/:id', { preHandler: [app.authenticate] }, removeFriend);
};