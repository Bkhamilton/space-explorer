from django.urls import path
from . import views

urlpatterns = [
    path('apod/', views.apod, name='apod'),
    path('launches/', views.launches, name='launches'),
    path('mars-weather/', views.mars_weather, name='mars_weather'),
    path('asteroids/', views.asteroids, name='asteroids'),
]
