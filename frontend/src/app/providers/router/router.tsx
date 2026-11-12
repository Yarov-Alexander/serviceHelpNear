import { createBrowserRouter } from "react-router";
import { MainLayout } from "@/app/layouts/MainLayout";
import { ProtectedRoute } from "@/app/providers/router/ProtectedRoute";
import { AccountPage } from "@/pages/account";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { NotFoundPage } from "@/pages/not-found";
import { RegisterPage } from "@/pages/register";
import { ROUTES } from "@/shared/config";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.register, element: <RegisterPage /> },
  {
    path: ROUTES.account,
    element: (
      <ProtectedRoute>
        <AccountPage />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <NotFoundPage /> },
]);