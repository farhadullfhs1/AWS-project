from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from .auth_views import EmailOrUsernameTokenObtainPairView, RegisterView


def health_check(_request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('', health_check, name='health_check'),
    path('health/', health_check, name='health_check_alias'),
    path('admin/', admin.site.urls),
    
    # API Endpoints
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),

    # Authentication
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
