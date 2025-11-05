# urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/nutrition/', include('nutrition.urls')),
    path('api/users/', include('users.urls')),  # Add this line
]