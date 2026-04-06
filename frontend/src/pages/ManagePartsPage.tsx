import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type PartItem = {
    id: number;
    name: string;
    price: number;
};

export function ManagePartsPage() {
    const [items, setItems] = useState<PartItem[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        try {
            const res = await api.get<PartItem[]>("/parts");
            setItems(res.data);
        } catch {
            setError("Failed to load parts");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function startEdit(item: PartItem) {
        setEditingId(item.id);
        setName(item.name);
        setPrice(String(item.price));
        setError("");
        setSuccess("");
    }

    function resetForm() {
        setEditingId(null);
        setName("");
        setPrice("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Part name is required");
            return;
        }

        if (!price || Number(price) <= 0) {
            setError("Price must be greater than zero");
            return;
        }

        try {
            if (editingId === null) {
                await api.post("/parts", {
                    name,
                    price: Number(price),
                });
                setSuccess("Part created successfully");
            } else {
                await api.put(`/parts/${editingId}`, {
                    name,
                    price: Number(price),
                });
                setSuccess("Part updated successfully");
            }

            resetForm();
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to save part");
        }
    }

    async function deletePart(id: number) {
        setError("");
        setSuccess("");

        try {
            await api.delete(`/parts/${id}`);
            setSuccess("Part deleted successfully");
            if (editingId === id) resetForm();
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to delete part");
        }
    }

    return (
        <div className="card-grid">
            <div>
                <h2>Manage parts</h2>
                <p className="card-subtitle">Create, edit and remove part types.</p>
            </div>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <div className="split-grid">
                <section className="section-card">
                    <h3 className="card-title">{editingId === null ? "Create part" : "Edit part"}</h3>

                    <form className="form-grid" onSubmit={handleSubmit}>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Part name" />
                        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
                        <div className="inline-actions">
                            <button type="submit">
                                {editingId === null ? "Create part" : "Update part"}
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
                    <h3 className="card-title">Current parts</h3>
                    <ul className="list-reset list-stack">
                        {items.map((item) => (
                            <li key={item.id} className="list-item">
                                <div className="entity-row">
                                    <div className="entity-main">
                                        <strong>{item.name}</strong>
                                        <div className="meta">{item.price} AZN</div>
                                    </div>

                                    <div className="inline-actions">
                                        <button className="secondary" type="button" onClick={() => startEdit(item)}>
                                            Edit
                                        </button>
                                        <button className="danger" type="button" onClick={() => deletePart(item.id)}>
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