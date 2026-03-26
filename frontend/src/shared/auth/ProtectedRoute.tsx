import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Props = {
    children: ReactElement;
    roles?: string[];
};

export function ProtectedRoute({ children, roles }: Props) {
    const { token, role } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (roles && (!role || !roles.includes(role))) {
        return <Navigate to="/" replace />;
    }

    return children;
}