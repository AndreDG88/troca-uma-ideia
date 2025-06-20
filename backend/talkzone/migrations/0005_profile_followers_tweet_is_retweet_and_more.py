# Generated by Django 4.2.21 on 2025-06-11 17:45

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("talkzone", "0004_tweet_likes"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="followers",
            field=models.ManyToManyField(
                blank=True, related_name="following", to="talkzone.profile"
            ),
        ),
        migrations.AddField(
            model_name="tweet",
            name="is_retweet",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="tweet",
            name="original_tweet",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="retweets",
                to="talkzone.tweet",
            ),
        ),
    ]
