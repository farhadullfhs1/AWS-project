from django.contrib import admin
from .models import Order, OrderItem, CartItem, StaffProfile

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'assigned_staff', 'pickup_branch', 'total_price', 'status', 'created_at')
    inlines = [OrderItemInline]

@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'branch')
    search_fields = ('user__username', 'user__email', 'employee_id', 'branch')

admin.site.register(CartItem)
