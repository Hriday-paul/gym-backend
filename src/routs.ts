import express, { NextFunction, Request, Response } from 'express';
import { authRouts } from './modules/auth/auth.rout';
import { userRoutes } from './modules/user/user.rout';
import { settingsRoutes } from './modules/settings/settings.rout';
import { contactRoutes } from './modules/contact/contact.route';
import { gymRoutes } from './modules/gym/gym.rout';
import { friendRouts } from './modules/friends/friends.rout';
import { eventRouts } from './modules/event/even.rout';
import { notificationRoute } from './modules/notification/notification.routes';
import { claimReqRouts } from './modules/claimRequests/claimRequests.rout';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: authRouts,
    },
    {
        path: '/users',
        route: userRoutes,
    },
    {
        path: '/setting',
        route: settingsRoutes,
    },
    {
        path: '/contacts',
        route: contactRoutes,
    },
    {
        path: '/gyms',
        route: gymRoutes,
    },
    {
        path: '/friends',
        route: friendRouts,
    },
    {
        path: '/events',
        route: eventRouts,
    },
    {
        path: '/notifications',
        route: notificationRoute,
    },
    {
        path: '/claim-reqs',
        route: claimReqRouts,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;