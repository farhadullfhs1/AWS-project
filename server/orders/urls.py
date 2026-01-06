from django.urls import path
from .views import AddToCartView, CartView, CreateOrderView, OrderListView

urlpatterns = [
    path('cart/add/', AddToCartView.as_view()),
    path('cart/', CartView.as_view()),
    path('create/', CreateOrderView.as_view()),
    path('history/', OrderListView.as_view()),
]
