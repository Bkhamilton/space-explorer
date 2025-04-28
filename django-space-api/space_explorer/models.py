from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class APOD(models.Model):
    title = models.CharField(max_length=200)
    explanation = models.TextField()
    url = models.URLField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    apod = models.ForeignKey(APOD, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class CachedAsteroid(models.Model):
    neo_reference_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    diameter_max_meters = models.FloatField()
    is_potentially_hazardous = models.BooleanField()
    close_approach_date = models.DateField()
    miss_distance_km = models.FloatField()
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class CachedMarsWeather(models.Model):
    sol = models.IntegerField(unique=True)  # Unique identifier for each Martian day
    temperature = models.FloatField()  # Average temperature
    temperature_min = models.FloatField(null=True, blank=True)  # Minimum temperature
    temperature_max = models.FloatField(null=True, blank=True)  # Maximum temperature
    wind_speed = models.FloatField()  # Average wind speed
    wind_speed_max = models.FloatField(null=True, blank=True)  # Maximum wind speed
    pressure = models.FloatField()  # Average pressure
    first_utc = models.DateTimeField(null=True, blank=True)  # First UTC timestamp
    last_utc = models.DateTimeField(null=True, blank=True)  # Last UTC timestamp
    most_common_wind_direction = models.CharField(max_length=50, null=True, blank=True)  # Most common wind direction
    last_updated = models.DateTimeField(auto_now=True)  # Timestamp for the last update

    def __str__(self):
        return f"Mars Weather Sol {self.sol}"

class CachedLaunch(models.Model):
    name = models.CharField(max_length=200)
    net = models.DateTimeField()
    status = models.CharField(max_length=100)
    mission = models.CharField(max_length=200, null=True, blank=True)
    rocket = models.CharField(max_length=200)
    pad = models.CharField(max_length=200)
    agency = models.CharField(max_length=200)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name