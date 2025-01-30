import { FastifySchema } from 'fastify';

export const changeSettingsSchema: FastifySchema = {
    querystring: {
        type: 'object',
        properties: {
            possibleMoves: { type: 'boolean' },
            vibration: { type: 'boolean' }
        }
    }
};  

export const editProfileSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            language: { type: 'string', enum: [ 'en-US', 'ru-RU', 'uk' ] },
            username: { type: 'string' }, 
            profilePicture: { type: 'string' }
        }
    }
};

export const registerUserSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            userId: { type: 'number' },
            username: { type: 'string' },
            profilePicture: { type: 'string' }
        },

        required: [ 'userId', 'username', 'profilePicture' ]
    }
};

export const authorizeUserSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            token: { type: 'string' }
        },

        required: ['token']
    }
};

export const getUserSchema: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        },

        required: ['id']
    }
};