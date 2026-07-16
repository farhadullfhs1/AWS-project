from django.db import models
from django.contrib.auth.models import User
from products.models import Product

BRANCH_CHOICES = [
    ('Thane', 'Thane'),
    ('Mulund', 'Mulund'),
    ('Bandra', 'Bandra'),
    ('Kurla', 'Kurla'),
    ('Dadar', 'Dadar'),
]

class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    employee_id = models.CharField(max_length=32, unique=True)
    branch = models.CharField(max_length=20, choices=BRANCH_CHOICES)

    def __str__(self):
        return f"{self.user.username} ({self.branch})"

class Order(models.Model):
    FULFILLMENT_CHOICES = [('pickup','Pickup'),('delivery','Delivery')]
    STATUS_CHOICES = [
        ('Processing', 'Processing'),
        ('Preparing', 'Preparing'),
        ('Ready for pickup', 'Ready for pickup'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    assigned_staff = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_orders')
    fulfillment_type = models.CharField(max_length=10, choices=FULFILLMENT_CHOICES, default='delivery')
    pickup_branch = models.CharField(max_length=20, choices=BRANCH_CHOICES, blank=True, default='Thane')
    delivery_address = models.TextField(blank=True, null=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Processing')
    created_at = models.DateTimeField(auto_now_add=True)
    claimed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_name = models.CharField(max_length=120) # Storing name statically in case product changes
    price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity} x {self.product_name}"
