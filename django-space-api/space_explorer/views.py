import requests
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from .models import APOD, Favorite, CachedAsteroid, CachedMarsWeather, CachedLaunch
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ObjectDoesNotExist
import json

def apod(request):
    date = request.GET.get('date', None)  # Get date from query params
    
    # Check cache first
    cache_key = f'apod_{date}' if date else 'apod_today'
    cached_response = cache.get(cache_key)
    
    if cached_response:
        return JsonResponse(cached_response)
    
    # Build NASA API URL
    nasa_url = f'https://api.nasa.gov/planetary/apod?api_key={settings.NASA_API_KEY}'
    if date:
        nasa_url += f'&date={date}'
    
    try:
        response = requests.get(nasa_url)
        response.raise_for_status()
        data = response.json()
        
        # Save to database (only if not exists)
        apod_obj, created = APOD.objects.get_or_create(
            date=data.get('date', timezone.now().date()),
            defaults={
                'title': data['title'],
                'explanation': data['explanation'],
                'url': data['url'],
                'hdurl': data.get('hdurl', ''),
                'media_type': data.get('media_type', 'image'),
                'copyright': data.get('copyright', '')
            }
        )
        
        # Cache for 24 hours
        cache.set(cache_key, data, 86400)
        return JsonResponse(data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def launches(request):
    # Try to get cached data
    cached_data = cache.get('launches_data')

    if not cached_data:
        # Check if DB has fresh data (<24 hours old)
        recent_launches = CachedLaunch.objects.filter(
            last_updated__gte=timezone.now() - timedelta(hours=24)
        ).values()

        if recent_launches.exists():
            cached_data = list(recent_launches)
            cache.set('launches_data', cached_data, 86400)  # Cache for 24 hours
        else:
            # Fetch fresh data from SpaceDevs API
            base_url = "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/"
            params = {
                'mode': 'detailed',
                'limit': 20,
                'ordering': 'net',
                'hide_recent_previous': 'true'
            }
            response = requests.get(base_url, params=params).json()

            # Save to database
            cached_data = []
            for launch in response.get('results', []):
                obj, _ = CachedLaunch.objects.update_or_create(
                    name=launch.get('name', 'Unnamed Launch'),
                    net=launch.get('net', None),
                    defaults={
                        'status': launch.get('status', {}).get('name', 'Status unknown'),
                        'mission': launch.get('mission', {}).get('name', 'No mission'),
                        'rocket': launch.get('rocket', {}).get('configuration', {}).get('name', 'Unknown rocket'),
                        'pad': launch.get('pad', {}).get('name', 'Unknown pad'),
                        'agency': launch.get('launch_service_provider', {}).get('name', 'Unknown agency'),
                    }
                )
                cached_data.append({
                    'name': obj.name,
                    'net': obj.net,
                    'status': obj.status,
                    'mission': obj.mission,
                    'rocket': obj.rocket,
                    'pad': obj.pad,
                    'agency': obj.agency,
                })

            cache.set('launches_data', cached_data, 86400)  # Cache for 24 hours

    return JsonResponse({'results': cached_data})

def mars_weather(request):
    url = f'https://api.nasa.gov/insight_weather/?api_key={settings.NASA_API_KEY}&feedtype=json&ver=1.0'
    response = requests.get(url)
    return JsonResponse(response.json())

def mars_weather2(request):
    # Try to get cached data
    cached_data = cache.get('mars_weather_data')

    if not cached_data:
        # Check if DB has fresh data (<24 hours old)
        recent_weather = CachedMarsWeather.objects.filter(
            last_updated__gte=timezone.now() - timedelta(hours=24)
        ).values()

        if recent_weather.exists():
            cached_data = list(recent_weather)
            cache.set('mars_weather_data', cached_data, 86400)  # Cache for 24 hours
        else:
            # Fetch fresh data from NASA API
            url = f'https://api.nasa.gov/insight_weather/?api_key={settings.NASA_API_KEY}&feedtype=json&ver=1.0'
            try:
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()
            except requests.exceptions.RequestException as e:
                return JsonResponse({'error': f'Failed to fetch data from NASA API: {str(e)}'}, status=500)

            # Validate response
            sol_keys = data.get('sol_keys', [])
            if not sol_keys:
                return JsonResponse({'error': 'No Mars weather data available'}, status=500)

            # Save to database
            cached_data = []
            for sol in sol_keys:
                sol_data = data.get(sol, {})
                obj, _ = CachedMarsWeather.objects.update_or_create(
                    sol=int(sol),  # Convert sol to an integer
                    defaults={
                        'temperature': sol_data.get('AT', {}).get('av', None),
                        'temperature_min': sol_data.get('AT', {}).get('mn', None),
                        'temperature_max': sol_data.get('AT', {}).get('mx', None),
                        'wind_speed': sol_data.get('HWS', {}).get('av', None),
                        'wind_speed_max': sol_data.get('HWS', {}).get('mx', None),
                        'pressure': sol_data.get('PRE', {}).get('av', None),
                        'first_utc': sol_data.get('First_UTC', None),
                        'last_utc': sol_data.get('Last_UTC', None),
                        'most_common_wind_direction': sol_data.get('WD', {}).get('most_common', {}).get('compass_point', None),
                    }
                )
                cached_data.append({
                    'sol': obj.sol,
                    'temperature': obj.temperature,
                    'temperature_min': obj.temperature_min,
                    'temperature_max': obj.temperature_max,
                    'wind_speed': obj.wind_speed,
                    'wind_speed_max': obj.wind_speed_max,
                    'pressure': obj.pressure,
                    'first_utc': obj.first_utc,
                    'last_utc': obj.last_utc,
                    'most_common_wind_direction': obj.most_common_wind_direction,
                })

            cache.set('mars_weather_data', cached_data, 86400)  # Cache for 24 hours

    return JsonResponse(cached_data, safe=False)

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
@require_http_methods(["POST"])
def favorite_apod(request):
    try:
        data = json.loads(request.body)
        
        # Get or create the APOD in your database
        apod_obj, created = APOD.objects.get_or_create(
            date=data.get('date'),
            defaults={
                'title': data['title'],
                'explanation': data['explanation'],
                'url': data['url'],
                'hdurl': data.get('hdurl', ''),
                'media_type': data.get('media_type', 'image'),
                'copyright': data.get('copyright', '')
            }
        )
        
        # Create the favorite relationship
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            apod=apod_obj
        )
        
        return JsonResponse({
            'status': 'success',
            'message': 'APOD favorited successfully',
            'favorite_id': favorite.id
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@login_required
@require_http_methods(["GET"])
def list_favorites(request):
    try:
        favorites = Favorite.objects.filter(user=request.user).select_related('apod')
        
        favorites_data = [{
            'id': fav.id,
            'apod': {
                'id': fav.apod.id,
                'title': fav.apod.title,
                'explanation': fav.apod.explanation,
                'url': fav.apod.url,
                'hdurl': fav.apod.hdurl,
                'date': fav.apod.date,
                'copyright': fav.apod.copyright,
                'media_type': fav.apod.media_type
            },
            'created_at': fav.created_at
        } for fav in favorites]
        
        return JsonResponse({
            'status': 'success',
            'favorites': favorites_data
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@login_required
@require_http_methods(["DELETE"])
def unfavorite_apod(request, apod_id):
    try:
        favorite = Favorite.objects.get(
            user=request.user,
            apod__id=apod_id
        )
        favorite.delete()
        
        return JsonResponse({
            'status': 'success',
            'message': 'APOD unfavorited successfully'
        })
        
    except ObjectDoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Favorite not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)