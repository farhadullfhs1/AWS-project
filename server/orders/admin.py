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
