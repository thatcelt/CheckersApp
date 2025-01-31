import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import authMiddlewarePlugin from './middlewares/auth.middleware';
import websocket from '@fastify/websocket';

import { config } from 'dotenv';
import { userRoutes } from './routes/user.route';
import { friendRoutes } from './routes/friend.route';
import { jwtTokenErrors } from './constants';
import { gameRoutes } from './routes/game.route';

config();
const app = fastify({logger: true});

app.register(websocket);

app.register(fastifyJwt, {
    secret: process.env.SECRET as string,
    messages: jwtTokenErrors,
    verify: {
        extractToken: (request) => request.headers.authorization
    }
});

app.register(authMiddlewarePlugin);
app.register(userRoutes, { prefix: '/api/v1/user' });
app.register(friendRoutes, { prefix: '/api/v1/friend' });
app.register(gameRoutes, { prefix: '/api/v1/game' });

const start = async () => {
    await app.listen({ port: 3000 });
    console.log('Listening');
}

start();