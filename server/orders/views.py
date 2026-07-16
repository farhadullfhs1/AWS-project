from django.db import transaction
from django.db import models
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from .models import CartItem, Order, OrderItem, StaffProfile, BRANCH_CHOICES
from products.models import Product
from .serializers import CartItemSerializer, OrderSerializer

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        if not product_id:
            return Response({"error": "product_id is required"}, status=400)
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response({"error": "quantity must be a positive integer"}, status=400)
        if quantity < 1:
            return Response({"error": "quantity must be at least 1"}, status=400)
        product = get_object_or_404(Product, id=product_id, available=True)
        
        # Check if item exists
        item, created = CartItem.objects.get_or_create(user=request.user, product=product)
        if not created:
            item.quantity += quantity
            item.save()
        else:
            item.quantity = quantity
            item.save(update_fields=['quantity'])
            
        return Response({"message": "Added to cart", "cart_count": CartItem.objects.filter(user=request.user).count()})

class CartView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        items = CartItem.objects.filter(user=request.user)
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data)

class CartRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)
        cart_item.delete()
        return Response({
            "message": "Item removed from cart",
            "cart_count": CartItem.objects.filter(user=request.user).count()
        })

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        cart_items = CartItem.objects.select_related('product').filter(user=request.user)
        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=400)

        fulfillment_type = request.data.get('fulfillment_type', 'delivery')
        pickup_branch = request.data.get('pickup_branch', 'Thane')
        delivery_address = request.data.get('delivery_address', '')

        if fulfillment_type not in {'pickup', 'delivery'}:
            return Response({"error": "Invalid fulfillment_type"}, status=400)
        if fulfillment_type == 'pickup' and pickup_branch not in dict(BRANCH_CHOICES):
            return Response({"error": "Invalid pickup_branch"}, status=400)

        with transaction.atomic():
            total = sum(i.product.price * i.quantity for i in cart_items)

            order = Order.objects.create(
                user=request.user,
                fulfillment_type=fulfillment_type,
                pickup_branch=pickup_branch if fulfillment_type == 'pickup' else '',
                delivery_address=delivery_address,
                total_price=total
            )

            # Move Cart Items to Order Items
            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    product_name=item.product.name,
                    price=item.product.price,
                    quantity=item.quantity
                )
                for item in cart_items
            ])
            
            # Clear Cart
            cart_items.delete()
        
        return Response({"order_id": order.id, "message": "Order placed successfully"})

class OrderStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, user=request.user)
        return Response({
            "id": order.id,
            "status": order.status,
            "pickup_eta_minutes": 0 if order.status in {'Ready for pickup', 'Delivered', 'Cancelled'} else 5,
            "pickup_branch": order.pickup_branch,
        })

class OrderCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, user=request.user)
        if order.status != 'Processing':
            return Response({"error": "Order cannot be cancelled"}, status=400)
        order.status = 'Cancelled'
        order.save(update_fields=['status'])
        return Response({"message": "Order cancelled", "order_id": order.id, "status": order.status})

class OrderCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        if not request.user.is_staff:
            return Response({"error": "Staff access required"}, status=status.HTTP_403_FORBIDDEN)
        branch = getattr(getattr(request.user, 'staff_profile', None), 'branch', '')
        if not branch:
            return Response({"error": "Staff branch not assigned"}, status=status.HTTP_403_FORBIDDEN)
        order = get_object_or_404(Order, id=order_id, pickup_branch=branch)
        if order.status != 'Ready for pickup':
            return Response({"error": "Order is not ready to be completed"}, status=400)
        if order.assigned_staff_id != request.user.id:
            return Response({"error": "You do not own this order"}, status=status.HTTP_403_FORBIDDEN)
        order.status = 'Delivered'
        order.save(update_fields=['status'])
        return Response({"message": "Order completed", "order_id": order.id, "status": order.status})

class OrderListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


class StaffOrderListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        if not self.request.user.is_staff:
            raise PermissionDenied("Staff access required")
        branch = getattr(getattr(self.request.user, 'staff_profile', None), 'branch', '')
        if not branch:
            raise PermissionDenied("Staff branch not assigned")
        return (
            Order.objects.filter(
                pickup_branch=branch,
                status__in=['Processing', 'Preparing', 'Ready for pickup'],
            )
            .filter(models.Q(assigned_staff__isnull=True) | models.Q(assigned_staff=self.request.user))
            .select_related('user', 'assigned_staff')
            .prefetch_related('items')
            .order_by('created_at')
        )


class StaffOrderActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        if not request.user.is_staff:
            return Response({"error": "Staff access required"}, status=status.HTTP_403_FORBIDDEN)

        action = (request.data.get('action') or '').strip().lower()
        branch = getattr(getattr(request.user, 'staff_profile', None), 'branch', '')
        if not branch:
            return Response({"error": "Staff branch not assigned"}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            order = get_object_or_404(Order.objects.select_for_update(), id=order_id, pickup_branch=branch)

            if action == 'preparing':
                if order.status != 'Processing':
                    return Response({"error": "Only placed orders can move to preparing"}, status=400)
                if order.assigned_staff_id and order.assigned_staff_id != request.user.id:
                    return Response({"error": "Order already claimed by another staff member"}, status=409)
                order.status = 'Preparing'
                order.assigned_staff = request.user
                order.claimed_at = order.claimed_at or timezone.now()
            elif action == 'ready':
                if order.status != 'Preparing':
                    return Response({"error": "Order must be preparing before marking ready"}, status=400)
                if order.assigned_staff_id != request.user.id:
                    return Response({"error": "You do not own this order"}, status=403)
                order.status = 'Ready for pickup'
            elif action == 'complete':
                if order.status != 'Ready for pickup':
                    return Response({"error": "Only ready orders can be completed"}, status=400)
                if order.assigned_staff_id != request.user.id:
                    return Response({"error": "You do not own this order"}, status=403)
                order.status = 'Delivered'
            else:
                return Response({"error": "Invalid action"}, status=400)

            order.save(update_fields=['status', 'assigned_staff', 'claimed_at'])
            return Response(OrderSerializer(order).data)
