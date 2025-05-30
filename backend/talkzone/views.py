from django.shortcuts import render
from rest_framework import generics, permissions
from .permissions import IsOwnerOrReadOnly
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

class TweetDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tweet.objects.all()
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# personaliza o retorno para mostrar apenas os tweets do usuário autenticado, ordenados do mais recente para o mais antigo.

class MyTweetsView(generics.ListAPIView):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tweet.objects.filter(user=self.request.user).order_by('-created_at')