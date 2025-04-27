import requests
from django.http import JsonResponse
from django.conf import settings

def apod(request):
    url = f'https://api.nasa.gov/planetary/apod?api_key={settings.NASA_API_KEY}'
    response = requests.get(url)
    return JsonResponse(response.json())

def launches(request):
    url = 'https://llapi.launchlibrary.net/1.4/launch'
    response = requests.get(url)
    return JsonResponse(response.json())

def mars_weather(request):
    url = f'https://api.nasa.gov/insight_weather/?api_key={settings.NASA_API_KEY}&feedtype=json&ver=1.0'
    response = requests.get(url)
    return JsonResponse(response.json())

def asteroids(request):
    url = f'https://api.nasa.gov/neo/rest/v1/feed?api_key={settings.NASA_API_KEY}'
    response = requests.get(url)
    return JsonResponse(response.json())
