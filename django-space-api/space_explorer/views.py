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
    try:
        # Use the development API endpoint for upcoming launches
        base_url = "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/"
        
        # Add filters for the API request
        params = {
            'mode': 'detailed',  # Get detailed response
            'limit': 20,         # Limit to 20 results
            'ordering': 'net',   # Sort by launch date
            'hide_recent_previous': 'true'  # Hide already launched
        }
        
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        # Extract and format the data
        launches = []
        for launch in response.json().get('results', []):
            launches.append({
                'name': launch.get('name', 'Unnamed Launch'),
                'net': launch.get('net', 'No date available'),
                'status': launch.get('status', {}).get('name', 'Status unknown'),
                'mission': launch.get('mission', {}).get('name', 'No mission'),
                'rocket': launch.get('rocket', {}).get('configuration', {}).get('name', 'Unknown rocket'),
                'pad': launch.get('pad', {}).get('name', 'Unknown pad'),
                'agency': launch.get('launch_service_provider', {}).get('name', 'Unknown agency')
            })
        
        return JsonResponse({'results': launches})
    
    except requests.exceptions.RequestException as e:
        return JsonResponse(
            {'error': f'Failed to fetch launches: {str(e)}'},
            status=500
        )

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