import {
    createContext,
    useContext,
    useMemo,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { clearAuth, getRole, getToken, saveAuth } from "./auth";

type AuthContextValue = {
    token: string | null;
    role: string | null;
    fullName: string | null;
    login: (token: string, role: string, fullName: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = getToken();
        const storedRole = getRole();
        const storedFullName = localStorage.getItem("fullName");

        if (storedToken) setToken(storedToken);
        if (storedRole) setRole(storedRole);
        if (storedFullName) setFullName(storedFullName);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            token,
            role,
            fullName,

            login: (newToken: string, newRole: string, newFullName: string) => {
                saveAuth(newToken, newRole);
                localStorage.setItem("fullName", newFullName);

                setToken(newToken);
                setRole(newRole);
                setFullName(newFullName);
            },

            logout: () => {
                clearAuth();
                localStorage.removeItem("fullName");

                setToken(null);
                setRole(null);
                setFullName(null);
            },
        }),
        [token, role, fullName]
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