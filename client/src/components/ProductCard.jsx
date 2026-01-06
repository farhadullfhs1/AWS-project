export default function ProductCard({ product, onAdd }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 10, margin: 10 }}>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <strong>₹{product.price}</strong>
      <br />
      <button onClick={() => onAdd(product.id)}>Add to Cart</button>
    </div>
  );
}
