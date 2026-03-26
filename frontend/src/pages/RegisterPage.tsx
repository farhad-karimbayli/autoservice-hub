import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../shared/api/client";
import { useAuth } from "../shared/auth/AuthContext";

type RegisterResponse = {
    token: string;
};

type MeResponse = {
    claims: Array<{
        type: string;
        value: string;
    }>;
};

export function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const registerResponse = await api.post<RegisterResponse>("/auth/register", {
                email,
                password,
            });

            const token = registerResponse.data.token;

            const meResponse = await api.get<MeResponse>("/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const roleClaim =
                meResponse.data.claims.find((x) => x.type.endsWith("/role"))?.value ??
                meResponse.data.claims.find((x) => x.type === "role")?.value ??
                "Client";

            login(token, roleClaim);
            navigate("/");
        } catch {
            setError("Registration failed");
        }
    }

    return (
        <div>
            <h2>Register</h2>

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

                <button type="submit">Register</button>
            </form>

            {error && <p>{error}</p>}
        </div>
    );
}