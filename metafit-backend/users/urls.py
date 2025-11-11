from django.urls import path
from .views import (
    LoginView, RegisterView, UserDetailView,
    CheckUsernameView, CheckEmailView,
    PhysicalInfoView, UserProfileView, WeightHistoryView
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    
    # Validation
    path('check-username/', CheckUsernameView.as_view(), name='check-username'),
    path('check-email/', CheckEmailView.as_view(), name='check-email'),
    
    # User details
    path('<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
    
    # Physical info endpoints
    path('<int:user_id>/physical-info/', PhysicalInfoView.as_view(), name='physical-info'),
    path('<int:user_id>/profile/', UserProfileView.as_view(), name='profile'),
    
    # Weight tracking endpoints
    path('<int:user_id>/weight-history/', WeightHistoryView.as_view(), name='weight-history'),
]