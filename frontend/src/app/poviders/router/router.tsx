import {ROUTES} from "@/shared/config/routes";
import {createBrowserRouter} from "react-router";

import { LoginPage } from "@/pages/login/ui/LoginPage";
import { RegisterPage } from "@/pages/register/ui/RegisterPage";
import { MainLayout } from "@/app/layouts/MainLayout";
import { HomePage } from "@/pages/home";
import { NotFoundPage } from "@/pages/notFound/ui/NotFoundPage";

export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            {path: ROUTES.home, element: <HomePage />},
        ]
    },
    {
        path: ROUTES.login,
        element: <LoginPage />
    },
    {
        path: ROUTES.register,
        element: <RegisterPage />
    },
    {
        path: "*",
        element: <NotFoundPage />
    }
]);