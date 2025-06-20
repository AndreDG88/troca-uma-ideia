# Generated by Django 4.2.21 on 2025-06-10 23:24

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("talkzone", "0003_profile_bio"),
    ]

    operations = [
        migrations.AddField(
            model_name="tweet",
            name="likes",
            field=models.ManyToManyField(
                blank=True, related_name="liked_tweets", to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
