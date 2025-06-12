from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile, Tweet
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    ProfileSerializer,
    TweetSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)

# Create your views here.


# View para listar e criar tweets
class TweetListCreateView(generics.ListCreateAPIView):
    queryset = Tweet.objects.all().order_by("-created_at")
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        return {"request": self.request}


# View para visualizar, atualizar ou deletar um tweet específico
class TweetDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tweet.objects.all()
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_serializer_context(self):
        return {"request": self.request}


# View para lista de tweets do feed
class TimelineView(ListAPIView):
    serializer_class = TweetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        only_following = self.request.query_params.get("only_following") == "true"

        if only_following:
            profile = Profile.objects.get(user=user)
            following_ids = profile.follows.values_list("id", flat=True)
            return Tweet.objects.filter(
                user__profile__in=profile.followers.all()
            ).order_by("-created_at")

        return Tweet.objects.all().order_by("-created_at")

    def get_serializer_context(self):
        return {"request": self.request}


# Views para adicionar e remover likes de tweets.
class ToggleLikeTweetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            tweet = Tweet.objects.get(pk=pk)
        except Tweet.DoesNotExist:
            return Response(
                {"detail": "Tweet não encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        if user in tweet.likes.all():
            tweet.likes.remove(user)
            return Response({"detail": "Curtida removida."}, status=status.HTTP_200_OK)
        else:
            tweet.likes.add(user)
            return Response({"detail": "Tweet curtido."}, status=status.HTTP_200_OK)


# View para listar todos os usuários
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserRegistrationSerializer
        return UserSerializer


# permite acesso a um usuário específico
class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


# View para listar apenas os tweets do usuário autenticado,
# ordenados do mais recente para o mais antigo
class MyTweetsView(generics.ListAPIView):
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tweet.objects.filter(user=self.request.user).order_by("-created_at")

    def get_serializer_context(self):
        return {"request": self.request}


# View para registro de novo usuário
class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Usuário criado com sucesso!"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# View para obter dados básicos do usuário autenticado
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ProfileDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = "username"


# View para visualizar ou atualizar o próprio perfil (bio e avatar)
class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user.profile


#  Seguir e deixar de seguir
class ToggleFollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            target_user = User.objects.get(username=username)
            target_profile = target_user.profile
            my_profile = request.user.profile
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

        if target_profile == my_profile:
            return Response(
                {"detail": "Você não pode seguir a si mesmo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if my_profile in target_profile.followers.all():
            target_profile.followers.remove(my_profile)
            return Response(
                {"detail": f"Você deixou de seguir {username}."},
                status=status.HTTP_200_OK,
            )
        else:
            target_profile.followers.add(my_profile)
            return Response(
                {"detail": f"Você agora está seguindo {username}."},
                status=status.HTTP_200_OK,
            )


# Vizualização de seguidores
class FollowersFollowingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            profile = user.profile
        except User.DoesNotExist:
            return Response({"detail": "Usuário não encontrado."}, status=404)

        followers = [
            {
                "id": follower.user.id,
                "username": follower.user.username,
                "avatar": (
                    request.build_absolute_uri(follower.avatar.url)
                    if follower.avatar
                    else None
                ),
            }
            for follower in profile.followers.all()
        ]
        following = [
            {
                "id": followed.user.id,
                "username": followed.user.username,
                "avatar": (
                    request.build_absolute_uri(followed.avatar.url)
                    if followed.avatar
                    else None
                ),
            }
            for followed in profile.following.all()
        ]

        return Response({"followers": followers, "following": following})
