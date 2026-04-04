import { useAuth } from "../shared/auth/AuthContext";

export function HomePage() {
    const { fullName } = useAuth();

    return (
        <div>
            <h2>
                {fullName ? `Welcome, ${fullName}!` : "Welcome!"}
            </h2>

            <p>
                This is AutoService Hub — manage services, appointments and parts easily.
            </p>
        </div>
    );
}