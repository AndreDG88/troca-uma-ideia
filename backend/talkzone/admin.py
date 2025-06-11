from django.contrib import admin

from .models import Tweet

# Register your models here.


@admin.register(Tweet)
class TweetAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content", "created_at", "likes_count")

    def likes_count(self, obj):
        return obj.likes.count()
