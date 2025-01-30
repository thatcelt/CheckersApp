import fastify from 'fastify';
import { userRoutes } from './routes/user.route';
import fastifyJwt from '@fastify/jwt';
import { config } from 'dotenv';
import { jwtTokenErrors } from './constants';
import authMiddlewarePlugin from './middlewares/auth.middleware';

config();
const app = fastify({logger: true});

app.register(fastifyJwt, {
    secret: process.env.SECRET as string,
    messages: jwtTokenErrors,
    verify: {
        extractToken: (request) => request.headers.authorization
    }
});

app.register(authMiddlewarePlugin);
app.register(userRoutes, { prefix: '/api/v1/user' });

const start = async () => {
    await app.listen({ port: 3000 });
    console.log('Listening');
}

start();