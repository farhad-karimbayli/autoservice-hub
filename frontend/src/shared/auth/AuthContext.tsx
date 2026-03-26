import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { clearAuth, getRole, getToken, saveAuth } from "./auth";

type AuthContextValue = {
    token: string | null;
    role: string | null;
    login: (token: string, role: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(getToken());
    const [role, setRole] = useState<string | null>(getRole());

    const value = useMemo<AuthContextValue>(
        () => ({
            token,
            role,
            login: (newToken: string, newRole: string) => {
                saveAuth(newToken, newRole);
                setToken(newToken);
                setRole(newRole);
            },
            logout: () => {
                clearAuth();
                setToken(null);
                setRole(null);
            },
        }),
        [token, role]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}