from rest_framework import serializers
from .models import Tweet
from django.contrib.auth.models import User

class TweetSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Tweet
        fields = ['id', 'user', 'content', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    tweets = TweetSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'tweets']
