import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

const authMiddlewarePlugin = (fastify: FastifyInstance, _opts: Record<never, never>, done: () => void) => {
    fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (error: any) {
            reply.status(401).send({ message: error.code });
        }
    });

    done();
};

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

export default fp(authMiddlewarePlugin);