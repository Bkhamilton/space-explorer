import requests
from django.http import JsonResponse
from django.conf import settings
from .models import APOD, Favorite
from django.contrib.auth.decorators import login_required

def apod(request):
    response = requests.get(f'https://api.nasa.gov/planetary/apod?api_key={settings.NASA_API_KEY}').json()
    
    # Save to database
    APOD.objects.create(
        title=response['title'],
        explanation=response['explanation'],
        url=response['url']
    )
    
    return JsonResponse(response)

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

@login_required
def favorite_apod(request, apod_id):
    apod = APOD.objects.get(id=apod_id)
    Favorite.objects.create(user=request.user, apod=apod)
    return JsonResponse({"status": "success"})