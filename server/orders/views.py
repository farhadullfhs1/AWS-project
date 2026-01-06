from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CartItem, Order, OrderItem
from products.models import Product
from .serializers import CartItemSerializer, OrderSerializer

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        product_id = request.data.get('product_id')
        product = Product.objects.get(id=product_id)
        
        # Check if item exists
        item, created = CartItem.objects.get_or_create(user=request.user, product=product)
        if not created:
            item.quantity += 1
            item.save()
            
        return Response({"message": "Added to cart", "cart_count": CartItem.objects.filter(user=request.user).count()})

class CartView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        items = CartItem.objects.filter(user=request.user)
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data)

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        cart_items = CartItem.objects.filter(user=request.user)
        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=400)

        total = sum(i.product.price * i.quantity for i in cart_items)
        
        # Create Order
        order = Order.objects.create(
            user=request.user,
            fulfillment_type=request.data.get('fulfillment_type', 'delivery'),
            delivery_address=request.data.get('delivery_address', ''),
            total_price=total
        )

        # Move Cart Items to Order Items
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product_name=item.product.name,
                price=item.product.price,
                quantity=item.quantity
            )
        
        # Clear Cart
        cart_items.delete()
        
        return Response({"order_id": order.id, "message": "Order placed successfully"})

class OrderListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
