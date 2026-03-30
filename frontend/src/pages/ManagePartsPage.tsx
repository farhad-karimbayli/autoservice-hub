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
    }

    function resetForm() {
        setEditingId(null);
        setName("");
        setPrice("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

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
            } else {
                await api.put(`/parts/${editingId}`, {
                    name,
                    price: Number(price),
                });
            }

            resetForm();
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to save part");
        }
    }

    async function deletePart(id: number) {
        setError("");

        try {
            await api.delete(`/parts/${id}`);
            if (editingId === id) {
                resetForm();
            }
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to delete part");
        }
    }

    return (
        <div>
            <h2>Manage parts</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Part name" />
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
                <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit">{editingId === null ? "Create part" : "Update part"}</button>
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
                        {item.name} — {item.price} AZN
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                            <button type="button" onClick={() => startEdit(item)}>
                                Edit
                            </button>
                            <button type="button" onClick={() => deletePart(item.id)}>
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}