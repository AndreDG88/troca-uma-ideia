from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Tweet
from .serializers import TweetSerializer, UserSerializer
from django.contrib.auth.models import User

# Create your views here.

class TweetListCreateView(generics.ListCreateAPIView):
    queryset = Tweet.objects.all().order_by('-created_at')
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer