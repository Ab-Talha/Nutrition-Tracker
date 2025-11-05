from django.urls import path
from .views import LoginView, RegisterView, UserDetailView, CheckUsernameView, CheckEmailView

app_name = 'users'

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('check-username/', CheckUsernameView.as_view(), name='check-username'),
    path('check-email/', CheckEmailView.as_view(), name='check-email'),
    path('<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
]