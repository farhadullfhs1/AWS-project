from django.urls import path
from .views import AddToCartView, CartView, CartRemoveView, CreateOrderView, OrderListView, OrderStatusView, OrderCancelView, OrderCompleteView, StaffOrderListView, StaffOrderActionView

urlpatterns = [
    path('cart/add/', AddToCartView.as_view()),
    path('cart/', CartView.as_view()),
    path('cart/remove/<int:item_id>/', CartRemoveView.as_view()),
    path('create/', CreateOrderView.as_view()),
    path('history/', OrderListView.as_view()),
    path('<int:order_id>/status/', OrderStatusView.as_view()),
    path('cancel/<int:order_id>/', OrderCancelView.as_view()),
    path('<int:order_id>/complete/', OrderCompleteView.as_view()),
    path('staff/orders/', StaffOrderListView.as_view()),
    path('staff/orders/<int:order_id>/action/', StaffOrderActionView.as_view()),
]
