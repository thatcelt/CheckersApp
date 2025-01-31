import { FastifyInstance, FastifyReply } from 'fastify';
import { editProfile, getUser, authorize, changeSettings, getRating } from '../controllers/user.controller';
import { EditProfileRequestBody, GetUserParams, ChangeSettingsRequestQuery } from '../controllers/types';
import { changeSettingsSchema, editProfileSchema, authorizeUserSchema, getUserSchema } from '../schemas/index';

export const userRoutes = (app: FastifyInstance) => {
    app.get<{ Params: GetUserParams}>('/getUser/:id', { preHandler: [app.authenticate], schema: getUserSchema }, getUser); 
    app.get('/getRatings', { preHandler: [app.authenticate] }, getRating);
    app.post('/authorize', { schema: authorizeUserSchema }, authorize);
    app.patch<{ Body: EditProfileRequestBody}>('/edit', { preHandler: [app.authenticate], schema: editProfileSchema }, editProfile);
    app.patch<{ Querystring: ChangeSettingsRequestQuery }>('/changeSettings', { preHandler: [app.authenticate], schema: changeSettingsSchema }, changeSettings);
}; 