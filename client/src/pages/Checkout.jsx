import { api } from "../services/api";

export default function Checkout() {
  const createOrder = () => {
    api.post("orders/create/", { fulfillment_type: "pickup" })
      .then(res => {
        api.post("payments/checkout/", { order_id: res.data.id })
          .then(p => window.location.href = p.data.checkout_url);
      });
  };

  return (
    <div>
      <h2>Checkout</h2>
      <button onClick={createOrder}>Pay Now</button>
    </div>
  );
}
