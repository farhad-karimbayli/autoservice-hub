import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../shared/api/client";
import { useAuth } from "../shared/auth/AuthContext";

type LoginResponse = {
    token: string;
};

type MeResponse = {
    claims: Array<{
        type: string;
        value: string;
    }>;
};

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const loginResponse = await api.post<LoginResponse>("/auth/login", {
                email,
                password,
            });

            const token = loginResponse.data.token;

            const meResponse = await api.get<MeResponse>("/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const roleClaim =
                meResponse.data.claims.find((x) => x.type.endsWith("/role"))?.value ??
                meResponse.data.claims.find((x) => x.type === "role")?.value ??
                "Client";

            const fullNameClaim =
                meResponse.data.claims.find((x) => x.type === "fullName")?.value ??
                meResponse.data.claims.find((x) => x.type.endsWith("/name"))?.value ??
                "User";

            login(token, roleClaim, fullNameClaim);
            navigate("/");
        } catch {
            setError("Invalid email or password");
        }
    }

    return (
        <div>
            <h2>Login</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>
            </form>

            {error && <p>{error}</p>}
        </div>
    );
}