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