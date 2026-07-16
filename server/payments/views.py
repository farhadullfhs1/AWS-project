import razorpay
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from orders.models import Order

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET else None

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not client:
            return Response({"error": "Payment gateway is not configured"}, status=503)

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
