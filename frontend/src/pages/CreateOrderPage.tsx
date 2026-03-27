import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../shared/api/client";

type PartItem = {
    id: number;
    name: string;
    price: number;
};

type InventoryItem = {
    partId: number;
    partName: string;
    partPrice: number;
    quantity: number;
};

export function CreateOrderPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [selectedPartId, setSelectedPartId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [cart, setCart] = useState<Array<{ partId: number; quantity: number; partName: string }>>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        api.get<InventoryItem[]>("/inventory")
            .then((res) => setItems(res.data))
            .catch(() => setError("Failed to load inventory"));
    }, []);

    function addToCart() {
        setError("");

        const partId = Number(selectedPartId);
        const qty = Number(quantity);

        const item = items.find((x) => x.partId === partId);

        if (!item || qty <= 0) {
            setError("Select a valid part and quantity");
            return;
        }

        setCart((prev) => {
            const existing = prev.find((x) => x.partId === partId);

            if (existing) {
                return prev.map((x) =>
                    x.partId === partId ? { ...x, quantity: x.quantity + qty } : x
                );
            }

            return [...prev, { partId, quantity: qty, partName: item.partName }];
        });

        setSelectedPartId("");
        setQuantity("1");
    }

    async function submitOrder() {
        setError("");
        setSuccess("");

        try {
            await api.post("/orders", {
                items: cart.map((x) => ({
                    partId: x.partId,
                    quantity: x.quantity,
                })),
            });

            setSuccess("Order created successfully");
            setCart([]);
            setTimeout(() => navigate("/orders/my"), 700);
        } catch {
            setError("Failed to create order");
        }
    }

    return (
        <div>
            <h2>Buy parts</h2>

            <div style={{ display: "grid", gap: 12, maxWidth: 520, marginBottom: 24 }}>
                <select value={selectedPartId} onChange={(e) => setSelectedPartId(e.target.value)}>
                    <option value="">Select part</option>
                    {items.map((item) => (
                        <option key={item.partId} value={item.partId}>
                            {item.partName} — {item.partPrice} AZN — in stock: {item.quantity}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />

                <button type="button" onClick={addToCart}>
                    Add to cart
                </button>
            </div>

            <h3>Cart</h3>

            {cart.length === 0 ? (
                <p>Cart is empty</p>
            ) : (
                <>
                    <ul>
                        {cart.map((item) => (
                            <li key={item.partId}>
                                {item.partName} — quantity: {item.quantity}
                            </li>
                        ))}
                    </ul>

                    <button onClick={submitOrder}>Submit order</button>
                </>
            )}

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}
        </div>
    );
}