import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { editProfile, registration, getUser, authorize, changeSettings, getRating } from '../controllers/user.controller';
import { AuthorizeRequestBody, EditProfileRequestBody, GetUserParams, RegisterRequestBody, ChangeSettingsRequestQuery } from '../controllers/types';
import { changeSettingsSchema, editProfileSchema, authorizeUserSchema, registerUserSchema, getUserSchema } from '../schemas/index';

export const userRoutes = (app: FastifyInstance) => {
    app.post<{Body: RegisterRequestBody}>('/register', { schema: registerUserSchema }, registration);
    app.patch<{Body: EditProfileRequestBody}>('/edit', { preHandler: [app.authenticate], schema: editProfileSchema }, editProfile);
    app.get<{Params: GetUserParams}>('/getUser/:id', { preHandler: [app.authenticate], schema: getUserSchema }, getUser); 
    app.post<{Body: AuthorizeRequestBody}>('/authorize', { preHandler: [app.authenticate], schema: authorizeUserSchema }, authorize);
    app.patch<{ Querystring: ChangeSettingsRequestQuery }>('/changeSettings', { preHandler: [app.authenticate], schema: changeSettingsSchema }, changeSettings);
    app.get('/getRatings', { preHandler: [app.authenticate] }, getRating)
}; 