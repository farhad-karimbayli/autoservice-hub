import { useState } from "react";
import { useNavigate } from "react-router";
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

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

export function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!fullName.trim()) {
            setError("Full name is required");
            return;
        }

        if (!phoneNumber.trim()) {
            setError("Phone number is required");
            return;
        }

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!password.trim()) {
            setError("Password is required");
            return;
        }

        try {
            const registerResponse = await api.post<RegisterResponse>("/auth/register", {
                fullName,
                phoneNumber,
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

            const fullNameClaim =
                meResponse.data.claims.find((x) => x.type === "fullName")?.value ??
                meResponse.data.claims.find((x) => x.type.endsWith("/name"))?.value ??
                "User";

            login(token, roleClaim, fullNameClaim);
            navigate("/");
        } catch (error) {
            setError(getErrorMessage(error, "Registration failed"));
        }
    }

    return (
        <div>
            <h2>Register</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
                <input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />

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