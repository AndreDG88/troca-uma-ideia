from django.contrib.auth.models import User
from django.db import models

# Create your models here.


# Modelo para criar tweets com autor, conteúdo e horário.
class Tweet(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="tweets"
    )  # para ligar o tweet ao usuário
    content = models.CharField(max_length=280)
    created_at = models.DateTimeField(
        auto_now_add=True
    )  # salva a data automaticamente quando o tweet é criado
    likes = models.ManyToManyField(User, related_name="liked_tweets", blank=True)
    original_tweet = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="retweets",
    )
    is_retweet = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}"

    def like_count(self):
        return self.likes.count()


# Cria um modelo Profile vinculado a um User
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(
        upload_to="avatars/", null=True, blank=True
    )  # O avatar é salvo na pasta media/avatars/
    bio = models.TextField(blank=True, default="")
    followers = models.ManyToManyField(
        "self", symmetrical=False, related_name="following", blank=True
    )

    def __str__(self):
        return f"Perfil de {self.user.username}"
