import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useUser } from "@/entities/user";
import { ROUTES } from "@/shared/config";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return children;
}
