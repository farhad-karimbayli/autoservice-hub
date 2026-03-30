import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type ServiceItem = {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
};

export function ManageServicesPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState("");

    async function loadData() {
        try {
            const res = await api.get<ServiceItem[]>("/services");
            setItems(res.data);
        } catch {
            setError("Failed to load services");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function startEdit(item: ServiceItem) {
        setEditingId(item.id);
        setName(item.name);
        setPrice(String(item.price));
        setDurationMinutes(String(item.durationMinutes));
        setError("");
    }

    function resetForm() {
        setEditingId(null);
        setName("");
        setPrice("");
        setDurationMinutes("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            if (editingId === null) {
                await api.post("/services", {
                    name,
                    price: Number(price),
                    durationMinutes: Number(durationMinutes),
                });
            } else {
                await api.put(`/services/${editingId}`, {
                    name,
                    price: Number(price),
                    durationMinutes: Number(durationMinutes),
                });
            }

            resetForm();
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to save service");
        }
    }

    async function deleteService(id: number) {
        setError("");

        try {
            await api.delete(`/services/${id}`);
            if (editingId === id) {
                resetForm();
            }
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to delete service");
        }
    }

    return (
        <div>
            <h2>Manage services</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" />
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
                <input
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="Duration minutes"
                />
                <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit">{editingId === null ? "Create service" : "Update service"}</button>
                    {editingId !== null && (
                        <button type="button" onClick={resetForm}>
                            Cancel edit
                        </button>
                    )}
                </div>
            </form>

            {error && <p>{error}</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id} style={{ marginBottom: 12 }}>
                        {item.name} — {item.price} AZN — {item.durationMinutes} min
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                            <button type="button" onClick={() => startEdit(item)}>
                                Edit
                            </button>
                            <button type="button" onClick={() => deleteService(item.id)}>
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}