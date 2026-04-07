import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type ProfileResponse = {
    id: string;
    fullName: string;
    phoneNumber?: string | null;
    email?: string | null;
    role: string;
};

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

export function MyProfilePage() {
    const [profile, setProfile] = useState<ProfileResponse | null>(null);

    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadProfile() {
        setError("");

        try {
            const res = await api.get<ProfileResponse>("/profile");
            setProfile(res.data);
            setFullName(res.data.fullName ?? "");
            setPhoneNumber(res.data.phoneNumber ?? "");
            setEmail(res.data.email ?? "");
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load profile"));
        }
    }

    useEffect(() => {
        loadProfile();
    }, []);

    async function updateProfile(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await api.put<ProfileResponse>("/profile", {
                fullName,
                phoneNumber,
                email,
            });

            setProfile(res.data);
            setSuccess("Profile updated successfully");
        } catch (error) {
            setError(getErrorMessage(error, "Failed to update profile"));
        }
    }

    async function changePassword(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmNewPassword) {
            setError("New password and confirmation do not match");
            return;
        }

        try {
            await api.post("/profile/change-password", {
                currentPassword,
                newPassword,
                confirmNewPassword,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setSuccess("Password changed successfully");
        } catch (error) {
            setError(getErrorMessage(error, "Failed to change password"));
        }
    }

    return (
        <div className="card-grid">
            <div>
                <h2>My profile</h2>
                <p className="card-subtitle">Manage your personal information and password.</p>
            </div>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <div className="split-grid">
                <section className="section-card">
                    <h3 className="card-title">Profile information</h3>

                    {profile && (
                        <div className="toolbar">
                            <span className="badge">{profile.role}</span>
                        </div>
                    )}

                    <form className="form-grid" onSubmit={updateProfile}>
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

                        <button type="submit">Save profile</button>
                    </form>
                </section>

                <section className="section-card">
                    <h3 className="card-title">Change password</h3>

                    <form className="form-grid" onSubmit={changePassword}>
                        <input
                            type="password"
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />

                        <button type="submit">Change password</button>
                    </form>
                </section>
            </div>
        </div>
    );
}