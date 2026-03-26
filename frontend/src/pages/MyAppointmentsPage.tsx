import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type AppointmentItem = {
    id: number;
    serviceName: string;
    date: string;
    status: string;
    comment?: string | null;
};

export function MyAppointmentsPage() {
    const [items, setItems] = useState<AppointmentItem[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get<AppointmentItem[]>("/appointments/my")
            .then((res) => setItems(res.data))
            .catch(() => setError("Failed to load appointments"));
    }, []);

    return (
        <div>
            <h2>My appointments</h2>

            {error && <p>{error}</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        {item.serviceName} — {new Date(item.date).toLocaleString()} — {item.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}