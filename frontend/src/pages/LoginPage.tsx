import { useState } from "react";
import { useNavigate } from "react-router";
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

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!password.trim()) {
            setError("Password is required");
            return;
        }

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
        } catch (error) {
            setError(getErrorMessage(error, "Invalid email or password"));
        }
    }

    return (
        <div
            style={{
                maxWidth: 520,
                margin: "0 auto",
            }}
        >
            <div className="section-card">
                <h2>Login</h2>
                <p className="meta">
                    Sign in to access appointments, inventory, orders and role-based tools.
                </p>

                {error && <div className="message error">{error}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
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
            </div>
        </div>
    );
}