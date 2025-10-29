import express, { NextFunction, Request, Response } from 'express';
import { authRouts } from './modules/auth/auth.rout';
import { userRoutes } from './modules/user/user.rout';
import { contactRoutes } from './modules/contact/contact.route';

import { dashboardRouts } from './modules/dasboard/dashboard.rout';
import { settingsRoutes } from './modules/settings/settings.rout';
import { notificationRoute } from './modules/notification/notification.routes';

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
        path: '/contacts',
        route: contactRoutes,
    },
    {
        path: '/dashboard',
        route: dashboardRouts,
    },
    {
        path: '/notifications',
        route: notificationRoute,
    },
    {
        path: '/setting',
        route: settingsRoutes,
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;