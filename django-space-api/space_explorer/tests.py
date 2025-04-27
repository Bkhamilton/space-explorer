from django.test import TestCase
from django.urls import reverse

class SpaceExplorerTests(TestCase):
    def test_apod_endpoint(self):
        response = self.client.get(reverse('apod'))
        self.assertEqual(response.status_code, 200)

    def test_launches_endpoint(self):
        response = self.client.get(reverse('launches'))
        self.assertEqual(response.status_code, 200)

    def test_mars_weather_endpoint(self):
        response = self.client.get(reverse('mars_weather'))
        self.assertEqual(response.status_code, 200)

    def test_asteroids_endpoint(self):
        response = self.client.get(reverse('asteroids'))
        self.assertEqual(response.status_code, 200)
