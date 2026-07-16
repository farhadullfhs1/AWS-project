from rest_framework import serializers
from .models import CartItem, Order, OrderItem

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_price = serializers.ReadOnlyField(source='product.price')
    product_image = serializers.ReadOnlyField(source='product.image')

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'product_image', 'quantity']

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_name', 'price', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%d", read_only=True)
    created_at = serializers.DateTimeField(read_only=True, format="%Y-%m-%d %H:%M")
    total = serializers.DecimalField(source='total_price', max_digits=10, decimal_places=2, read_only=True)
    pickup_eta_minutes = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='user.username', read_only=True)
    can_cancel = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    assigned_staff_username = serializers.SerializerMethodField()
    assigned_staff_email = serializers.SerializerMethodField()

    def get_pickup_eta_minutes(self, obj):
        if obj.fulfillment_type != 'pickup':
            return None
        if obj.status in {'Ready for pickup', 'Delivered', 'Completed', 'Cancelled'}:
            return 0
        return 5

    def get_can_cancel(self, obj):
        return obj.status == 'Processing'

    def get_is_active(self, obj):
        return obj.status not in {'Delivered', 'Cancelled', 'Completed'}

    def get_assigned_staff_username(self, obj):
        return obj.assigned_staff.username if obj.assigned_staff else ''

    def get_assigned_staff_email(self, obj):
        return obj.assigned_staff.email if obj.assigned_staff else ''

    class Meta:
        model = Order
        fields = ['id', 'date', 'created_at', 'total', 'status', 'items', 'fulfillment_type', 'pickup_branch', 'delivery_address', 'pickup_eta_minutes', 'customer_name', 'can_cancel', 'is_active', 'assigned_staff_username', 'assigned_staff_email']
