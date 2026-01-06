import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get("orders/cart/").then(res => setItems(res.data));
  }, []);

  return (
    <div>
      <h2>Your Cart</h2>
      {items.map(i => (
        <p key={i.id}>{i.product} x {i.quantity}</p>
      ))}
      <button onClick={() => nav("/checkout")}>Checkout</button>
    </div>
  );
}
