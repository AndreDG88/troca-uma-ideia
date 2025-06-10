from django.http import JsonResponse
from django.urls import path

from .views import (
    LikeTweetView,
    MyProfileView,
    MyTweetsView,
    ProfileView,
    TweetDetailView,
    TweetListCreateView,
    UnlikeTweetView,
    UserDetailView,
    UserListCreateView,
)


def talkzone_home(request):
    rotas = {
        "tweets_list_create": "/api/tweets/",
        "tweets_detail": "/api/tweets/<int:pk>/",
        "users_list_create": "/api/users/",
        "users_detail": "/api/users/<int:pk>/",
        "my_tweets": "/api/mytweets/",
        "profile": "/api/profile/",
        "my_profile": "/api/myprofile/",
    }
    return JsonResponse(
        {
            "mensagem": "Rotas da app talkzone",
            "rotas_disponiveis": rotas,
        }
    )


urlpatterns = [
    path("", talkzone_home, name="talkzone-home"),
    path("tweets/", TweetListCreateView.as_view(), name="tweet-list-create"),
    path("users/", UserListCreateView.as_view(), name="user-list-create"),
    path("tweets/<int:pk>/", TweetDetailView.as_view(), name="tweet-detail"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("mytweets/", MyTweetsView.as_view(), name="my-tweets"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("myprofile/", MyProfileView.as_view(), name="my-profile"),
    path("tweets/<int:pk>/like/", LikeTweetView.as_view(), name="like-tweet"),
    path("tweets/<int:pk>/unlike/", UnlikeTweetView.as_view(), name="unlike-tweet"),
]
