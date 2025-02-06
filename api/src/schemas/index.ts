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
            language: { type: 'string', enum: [ 'en', 'ru', 'ua' ] },
            username: { type: 'string' }, 
            profilePicture: { type: 'string' }
        }
    }
};

export const authorizeUserSchema: FastifySchema = {
    querystring: {
        type: 'object',
        properties: {
            queryParams: { type: 'string' }
        }
    }
};


export const getUserSchema: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' }
        },

        required: ['id']
    }
};
