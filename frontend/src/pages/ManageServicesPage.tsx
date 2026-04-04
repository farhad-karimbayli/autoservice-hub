import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type ServiceItem = {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
};

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

export function ManageServicesPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        setError("");

        try {
            const res = await api.get<ServiceItem[]>("/services");
            setItems(res.data);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load services"));
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
        setSuccess("");
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
        setSuccess("");

        if (!name.trim()) {
            setError("Service name is required");
            return;
        }

        if (!price || Number(price) < 0) {
            setError("Price must be zero or greater");
            return;
        }

        if (!durationMinutes || Number(durationMinutes) <= 0) {
            setError("Duration must be greater than zero");
            return;
        }

        try {
            if (editingId === null) {
                await api.post("/services", {
                    name,
                    price: Number(price),
                    durationMinutes: Number(durationMinutes),
                });

                setSuccess("Service created successfully");
            } else {
                await api.put(`/services/${editingId}`, {
                    name,
                    price: Number(price),
                    durationMinutes: Number(durationMinutes),
                });

                setSuccess("Service updated successfully");
            }

            resetForm();
            await loadData();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to save service"));
        }
    }

    async function deleteService(id: number) {
        setError("");
        setSuccess("");

        try {
            await api.delete(`/services/${id}`);

            if (editingId === id) {
                resetForm();
            }

            setSuccess("Service deleted successfully");
            await loadData();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to delete service"));
        }
    }

    return (
        <div className="section-card">
            <h2>Manage services</h2>
            <p className="meta">
                Create, update and delete service types available in the system.
            </p>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <div className="grid-2">
                <section className="section-card">
                    <h3 style={{ marginTop: 0 }}>
                        {editingId === null ? "Create service" : "Edit service"}
                    </h3>

                    <form onSubmit={handleSubmit} className="form-grid">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Service name"
                        />

                        <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Price"
                        />

                        <input
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(e.target.value)}
                            placeholder="Duration minutes"
                        />

                        <div className="inline-actions">
                            <button type="submit">
                                {editingId === null ? "Create service" : "Update service"}
                            </button>

                            {editingId !== null && (
                                <button type="button" className="secondary" onClick={resetForm}>
                                    Cancel edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="section-card">
                    <h3 style={{ marginTop: 0 }}>Current services</h3>

                    {items.length === 0 ? (
                        <p className="meta">No services found.</p>
                    ) : (
                        <ul className="list-reset list-stack">
                            {items.map((item) => (
                                <li key={item.id} className="list-item">
                                    <div style={{ display: "grid", gap: 8 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                            <strong>{item.name}</strong>
                                            <span className="badge">{item.durationMinutes} min</span>
                                        </div>

                                        <div className="meta">Price: {item.price} AZN</div>

                                        <div className="inline-actions">
                                            <button type="button" onClick={() => startEdit(item)}>
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="danger"
                                                onClick={() => deleteService(item.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}