import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type PartItem = {
    id: number;
    name: string;
    price: number;
};

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

export function ManagePartsPage() {
    const [items, setItems] = useState<PartItem[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        setError("");

        try {
            const res = await api.get<PartItem[]>("/parts");
            setItems(res.data);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load parts"));
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
        } catch (error) {
            setError(getErrorMessage(error, "Failed to save part"));
        }
    }

    async function deletePart(id: number) {
        setError("");
        setSuccess("");

        try {
            await api.delete(`/parts/${id}`);

            if (editingId === id) {
                resetForm();
            }

            setSuccess("Part deleted successfully");
            await loadData();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to delete part"));
        }
    }

    return (
        <div className="section-card">
            <h2>Manage parts</h2>
            <p className="meta">
                Create, update and delete part types used in the inventory and catalog.
            </p>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <div className="grid-2">
                <section className="section-card">
                    <h3 style={{ marginTop: 0 }}>
                        {editingId === null ? "Create part" : "Edit part"}
                    </h3>

                    <form onSubmit={handleSubmit} className="form-grid">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Part name"
                        />

                        <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Price"
                        />

                        <div className="inline-actions">
                            <button type="submit">
                                {editingId === null ? "Create part" : "Update part"}
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
                    <h3 style={{ marginTop: 0 }}>Current parts</h3>

                    {items.length === 0 ? (
                        <p className="meta">No parts found.</p>
                    ) : (
                        <ul className="list-reset list-stack">
                            {items.map((item) => (
                                <li key={item.id} className="list-item">
                                    <div style={{ display: "grid", gap: 8 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                            <strong>{item.name}</strong>
                                            <span className="badge">{item.price} AZN</span>
                                        </div>

                                        <div className="inline-actions">
                                            <button type="button" onClick={() => startEdit(item)}>
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="danger"
                                                onClick={() => deletePart(item.id)}
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