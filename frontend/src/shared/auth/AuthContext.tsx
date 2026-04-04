import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

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
        const storedToken = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");
        const storedFullName = localStorage.getItem("fullName");

        if (storedToken) setToken(storedToken);
        if (storedRole) setRole(storedRole);
        if (storedFullName) setFullName(storedFullName);
    }, []);

    function login(newToken: string, newRole: string, newFullName: string) {
        setToken(newToken);
        setRole(newRole);
        setFullName(newFullName);

        localStorage.setItem("token", newToken);
        localStorage.setItem("role", newRole);
        localStorage.setItem("fullName", newFullName);
    }

    function logout() {
        setToken(null);
        setRole(null);
        setFullName(null);

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("fullName");
    }

    const value = useMemo(
        () => ({
            token,
            role,
            fullName,
            login,
            logout,
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