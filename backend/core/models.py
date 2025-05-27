from django.db import models
from django.contrib.auth.models import User

# Create your models here.

# Modelo para criar tweets com autor, conteúdo e horário. 
class Tweet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) # para ligar o tweet ao usuário
    content = models.CharField(max_length=280)
    timestamp = models.DateTimeField(auto_now_add=True) # salva a data automaticamente quando o tweet é criado