import os
import sys
from pathlib import Path

# Base directory name
BASE_DIR = "server"

# File contents definitions
files = {}

# -----------------------------------------------------------------------------
# 1. ROOT FILES
# -----------------------------------------------------------------------------

files[f"{BASE_DIR}/requirements.txt"] = """
django>=5.0
djangorestframework
djangorestframework-simplejwt
django-cors-headers
stripe
"""

files[f"{BASE_DIR}/manage.py"] = """#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
"""

# -----------------------------------------------------------------------------
# 2. CORE APP (Settings & Config)
# -----------------------------------------------------------------------------

files[f"{BASE_DIR}/core/__init__.py"] = ""

files[f"{BASE_DIR}/core/settings.py"] = """
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-dev-key-change-this-in-production'
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local apps
    'products',
    'orders',
    'payments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Added for React frontend
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# DRF Config
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', # Allow read access by default
    ]
}

# JWT Config
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# CORS Config (Allow React Frontend)
CORS_ALLOW_ALL_ORIGINS = True # Change to specific domain in production
"""

files[f"{BASE_DIR}/core/urls.py"] = """
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Endpoints
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),

    # Authentication
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
"""

files[f"{BASE_DIR}/core/wsgi.py"] = """
import os
from django.core.wsgi import get_wsgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()
"""

files[f"{BASE_DIR}/core/asgi.py"] = """
import os
from django.core.asgi import get_asgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_asgi_application()
"""

# -----------------------------------------------------------------------------
# 3. PRODUCTS APP (Updated fields for Frontend compatibility)
# -----------------------------------------------------------------------------

files[f"{BASE_DIR}/products/__init__.py"] = ""
files[f"{BASE_DIR}/products/apps.py"] = """
from django.apps import AppConfig
class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'
"""

files[f"{BASE_DIR}/products/models.py"] = """
from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Hot Coffee', 'Hot Coffee'),
        ('Cold Coffee', 'Cold Coffee'),
        ('Tea', 'Tea'),
        ('Snacks', 'Snacks'),
    ]

    name = models.CharField(max_length=120)
    desc = models.TextField() # Renamed to match frontend 'desc'
    price = models.DecimalField(max_digits=8, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Hot Coffee')
    image = models.URLField(max_length=500, blank=True) # Using URL for simplicity
    rating = models.FloatField(default=4.5)
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name
"""

files[f"{BASE_DIR}/products/admin.py"] = """
from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'available')
"""

files[f"{BASE_DIR}/products/serializers.py"] = """
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
"""

files[f"{BASE_DIR}/products/views.py"] = """
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import Product
from .serializers import ProductSerializer
from rest_framework.permissions import AllowAny

class ProductListView(ListAPIView):
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
"""

files[f"{BASE_DIR}/products/urls.py"] = """
from django.urls import path
from .views import ProductListView, ProductDetailView

urlpatterns = [
    path('', ProductListView.as_view()),
    path('<int:pk>/', ProductDetailView.as_view()),
]
"""

# -----------------------------------------------------------------------------
# 4. ORDERS APP (With fixed logic for Order History)
# -----------------------------------------------------------------------------

files[f"{BASE_DIR}/orders/__init__.py"] = ""
files[f"{BASE_DIR}/orders/apps.py"] = """
from django.apps import AppConfig
class OrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'orders'
"""

files[f"{BASE_DIR}/orders/models.py"] = """
from django.db import models
from django.contrib.auth.models import User
from products.models import Product

class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

class Order(models.Model):
    FULFILLMENT_CHOICES = [('pickup','Pickup'),('delivery','Delivery')]
    STATUS_CHOICES = [('Processing','Processing'),('Delivered','Delivered'), ('Cancelled', 'Cancelled')]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    fulfillment_type = models.CharField(max_length=10, choices=FULFILLMENT_CHOICES, default='delivery')
    delivery_address = models.TextField(blank=True, null=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Processing')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_name = models.CharField(max_length=120) # Storing name statically in case product changes
    price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity} x {self.product_name}"
"""

files[f"{BASE_DIR}/orders/admin.py"] = """
from django.contrib import admin
from .models import Order, OrderItem, CartItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'status', 'created_at')
    inlines = [OrderItemInline]

admin.site.register(CartItem)
"""

files[f"{BASE_DIR}/orders/serializers.py"] = """
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
    total = serializers.DecimalField(source='total_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'date', 'total', 'status', 'items', 'fulfillment_type', 'delivery_address']
"""

files[f"{BASE_DIR}/orders/views.py"] = """
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
"""

files[f"{BASE_DIR}/orders/urls.py"] = """
from django.urls import path
from .views import AddToCartView, CartView, CreateOrderView, OrderListView

urlpatterns = [
    path('cart/add/', AddToCartView.as_view()),
    path('cart/', CartView.as_view()),
    path('create/', CreateOrderView.as_view()),
    path('history/', OrderListView.as_view()),
]
"""

# -----------------------------------------------------------------------------
# 5. PAYMENTS APP
# -----------------------------------------------------------------------------

files[f"{BASE_DIR}/payments/__init__.py"] = ""
files[f"{BASE_DIR}/payments/apps.py"] = """
from django.apps import AppConfig
class PaymentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'payments'
"""

files[f"{BASE_DIR}/payments/views.py"] = """
import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from orders.models import Order

# Placeholder Key
stripe.api_key = "sk_test_placeholder_key"

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            order_id = request.data.get('order_id')
            order = Order.objects.get(id=order_id, user=request.user)
            
            # Create Stripe Session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'inr',
                        'product_data': {'name': f'Order #{order.id}'},
                        'unit_amount': int(order.total_price * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url='http://localhost:3000/orders',
                cancel_url='http://localhost:3000/cart',
            )
            return Response({"checkout_url": session.url})
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
"""

files[f"{BASE_DIR}/payments/urls.py"] = """
from django.urls import path
from .views import CheckoutView

urlpatterns = [
    path('checkout/', CheckoutView.as_view()),
]
"""

# -----------------------------------------------------------------------------
# UTILITY: FILE WRITER
# -----------------------------------------------------------------------------

def create_backend():
    print(f"🚀 Initializing Django Project in '{BASE_DIR}'...")

    for file_path, content in files.items():
        # Create directories if needed
        path_obj = Path(file_path)
        path_obj.parent.mkdir(parents=True, exist_ok=True)
        
        # Write content
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        
        print(f"✔ Created: {file_path}")

    print("\n✅ Backend structure created successfully!")
    print("\nNext Steps:")
    print("1. cd server")
    print("2. pip install -r requirements.txt")
    print("3. python manage.py makemigrations")
    print("4. python manage.py migrate")
    print("5. python manage.py createsuperuser")
    print("6. python manage.py runserver")

if __name__ == "__main__":
    create_backend()