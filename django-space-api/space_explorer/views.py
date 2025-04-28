import requests
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from .models import APOD, Favorite, CachedAsteroid
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
    # Try to get cached data
    cached_data = cache.get('asteroids_data')
    
    if not cached_data:
        # Check if DB has fresh data (<24 hours old)
        recent_asteroids = CachedAsteroid.objects.filter(
            last_updated__gte=timezone.now() - timedelta(hours=24)
        )
        
        if recent_asteroids.exists():
            cached_data = list(recent_asteroids.values())
            cache.set('asteroids_data', cached_data, 86400)  # Cache for 24h
        else:
            # Fetch fresh from NASA API
            fresh_data = fetch_from_nasa_api()
            cache.set('asteroids_data', fresh_data, 86400)
            cached_data = fresh_data
            
    return JsonResponse(cached_data, safe=False)

def fetch_from_nasa_api():
    url = f'https://api.nasa.gov/neo/rest/v1/feed?api_key={settings.NASA_API_KEY}'
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': f'Failed to fetch data from NASA API: {str(e)}'}, status=500)
    
    # Save to database
    asteroids = []
    for neo in data['near_earth_objects'].values():
        for item in neo:
            obj, _ = CachedAsteroid.objects.update_or_create(
                neo_reference_id=item['neo_reference_id'],
                defaults={
                    'name': item['name'],
                    'diameter_max_meters': item['estimated_diameter']['meters']['estimated_diameter_max'],
                    'is_potentially_hazardous': item['is_potentially_hazardous_asteroid'],
                    'close_approach_date': item['close_approach_data'][0]['close_approach_date'],
                    'miss_distance_km': float(item['close_approach_data'][0]['miss_distance']['kilometers']),
                }
            )
            asteroids.append({
                'neo_reference_id': obj.neo_reference_id,
                'name': obj.name,
                'diameter_max_meters': obj.diameter_max_meters,
                'is_potentially_hazardous': obj.is_potentially_hazardous,
                'close_approach_date': obj.close_approach_date,
                'miss_distance_km': obj.miss_distance_km,
            })
    return asteroids

@login_required
def favorite_apod(request, apod_id):
    apod = APOD.objects.get(id=apod_id)
    Favorite.objects.create(user=request.user, apod=apod)
    return JsonResponse({"status": "success"})