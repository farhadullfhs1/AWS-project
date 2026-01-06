import { useEffect, useState } from "react";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("products/").then(res => setProducts(res.data));
  }, []);

  const addToCart = (id) => {
    api.post("orders/cart/add/", { product_id: id })
      .then(() => alert("Added to cart"))
      .catch(() => alert("Login required"));
  };

  return (
    <div>
      <h2>Menu</h2>
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAdd={addToCart} />
      ))}
    </div>
  );
}
