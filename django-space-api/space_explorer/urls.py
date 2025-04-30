from django.urls import path
from django.contrib.auth.views import LoginView
from . import views

urlpatterns = [
    path('apod/', views.apod, name='apod'),
    path('launches/', views.launches, name='launches'),
    path('mars-weather/', views.mars_weather, name='mars_weather'),
    path('asteroids/', views.asteroids, name='asteroids'),
    # New endpoints for favorites
    path('accounts/login/', LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('favorites/', views.list_favorites, name='list_favorites'),
    path('favorite-apod/', views.favorite_apod, name='favorite_apod'),
    path('unfavorite-apod/<int:apod_id>/', views.unfavorite_apod, name='unfavorite_apod'),
]
