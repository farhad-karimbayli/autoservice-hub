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
    const [success, setSuccess] = useState("");

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
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to save service");
        }
    }

    async function deleteService(id: number) {
        setError("");
        setSuccess("");

        try {
            await api.delete(`/services/${id}`);
            setSuccess("Service deleted successfully");
            if (editingId === id) resetForm();
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to delete service");
        }
    }

    return (
        <div className="card-grid">
            <div>
                <h2>Manage services</h2>
                <p className="card-subtitle">Create, edit and remove service types.</p>
            </div>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <div className="split-grid">
                <section className="section-card">
                    <h3 className="card-title">{editingId === null ? "Create service" : "Edit service"}</h3>

                    <form className="form-grid" onSubmit={handleSubmit}>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" />
                        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
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
                                <button className="secondary" type="button" onClick={resetForm}>
                                    Cancel edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="section-card">
                    <h3 className="card-title">Current services</h3>
                    <ul className="list-reset list-stack">
                        {items.map((item) => (
                            <li key={item.id} className="list-item">
                                <div className="entity-row">
                                    <div className="entity-main">
                                        <strong>{item.name}</strong>
                                        <div className="meta">
                                            {item.price} AZN • {item.durationMinutes} min
                                        </div>
                                    </div>

                                    <div className="inline-actions">
                                        <button className="secondary" type="button" onClick={() => startEdit(item)}>
                                            Edit
                                        </button>
                                        <button className="danger" type="button" onClick={() => deleteService(item.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}