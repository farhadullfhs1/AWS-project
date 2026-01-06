import razorpay
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from orders.models import Order

# --- CONFIGURATION ---
# 1. Go to https://dashboard.razorpay.com/app/keys
# 2. Generate Test Keys
# 3. Paste them below
RAZORPAY_KEY_ID = "rzp_test_S0ZlxoAK2mHV8C"
RAZORPAY_KEY_SECRET = "uKdyyXVedgC0gUoF5ZHsHoBB"

# Initialize Client
client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        try:
            # Get the order belonging to the user
            order = Order.objects.get(id=order_id, user=request.user)
            
            # Create a Razorpay Order
            # Note: Amount is in paise (multiply INR by 100)
            data = { 
                "amount": int(order.total_price * 100), 
                "currency": "INR", 
                "receipt": str(order.id),
                "payment_capture": 1 
            }
            payment = client.order.create(data=data)

            # Send back the details Frontend needs to open the popup
            return Response({
                "razorpay_order_id": payment['id'],
                "amount": payment['amount'],
                "currency": payment['currency'],
                "key": RAZORPAY_KEY_ID
            })
            
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)
        except Exception as e:
            print(f"Payment Error: {str(e)}")
            return Response({"error": "Payment initialization failed"}, status=400)
