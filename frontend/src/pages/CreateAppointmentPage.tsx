import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../shared/api/client";

type ServiceItem = {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
};

export function CreateAppointmentPage() {
    const navigate = useNavigate();

    const [services, setServices] = useState<ServiceItem[]>([]);
    const [serviceId, setServiceId] = useState("");
    const [date, setDate] = useState("");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        api.get<ServiceItem[]>("/services")
            .then((res) => setServices(res.data))
            .catch(() => setError("Failed to load services"));
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await api.post("/appointments", {
                serviceId: Number(serviceId),
                date,
                comment,
            });

            setSuccess("Appointment created successfully");
            setTimeout(() => navigate("/appointments/my"), 700);
        } catch {
            setError("Failed to create appointment");
        }
    }

    return (
        <div>
            <h2>Book service</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
                <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                    <option value="">Select service</option>
                    {services.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name} — {item.price} AZN — {item.durationMinutes} min
                        </option>
                    ))}
                </select>

                <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <textarea
                    placeholder="Comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                />

                <button type="submit">Create appointment</button>
            </form>

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}
        </div>
    );
}