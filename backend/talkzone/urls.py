from django.http import JsonResponse
from django.urls import path

from .views import (
    FollowersFollowingView,
    MyProfileView,
    MyTweetsView,
    ProfileDetailView,
    ProfileView,
    RegisterView,
    TimelineView,
    ToggleFollowView,
    ToggleLikeTweetView,
    TweetDetailView,
    TweetListCreateView,
    UserDetailView,
    UserListCreateView,
)


def talkzone_home(request):
    rotas = {
        "tweets_list_create": "/api/tweets/",
        "tweets_detail": "/api/tweets/<int:pk>/",
        "tweets_toggle_like": "/api/tweets/<int:pk>/like/",
        "timeline": "/api/timeline/?only_following=true|false",
        "my_tweets": "/api/mytweets/",
        "users_list_create": "/api/users/",
        "users_detail": "/api/users/<int:pk>/",
        "register": "/api/register/",
        "profile": "/api/profile/",
        "my_profile": "/api/myprofile/",
        "profile_detail": "/api/profiles/<str:username>/",
    }
    return JsonResponse(
        {
            "mensagem": "Rotas da app talkzone",
            "rotas_disponiveis": rotas,
        }
    )


urlpatterns = [
    path("", talkzone_home, name="talkzone-home"),
    # Tweets
    path("tweets/", TweetListCreateView.as_view(), name="tweet-list-create"),
    path("tweets/<int:pk>/", TweetDetailView.as_view(), name="tweet-detail"),
    path(
        "tweets/<int:pk>/like/", ToggleLikeTweetView.as_view(), name="tweet-toggle-like"
    ),
    # Tweets do usuário autenticado
    path("mytweets/", MyTweetsView.as_view(), name="my-tweets"),
    # Timeline
    path("timeline/", TimelineView.as_view(), name="timeline"),
    # Usuários
    path("users/", UserListCreateView.as_view(), name="user-list-create"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("register/", RegisterView.as_view(), name="user-register"),
    # Perfil próprio
    path("profile/", ProfileView.as_view(), name="profile"),
    path("myprofile/", MyProfileView.as_view(), name="my-profile"),
    # Perfil de outro usuário (por username)
    path(
        "profiles/<str:username>/", ProfileDetailView.as_view(), name="profile-detail"
    ),
    # Seguir / deixar de seguir usuário
    path(
        "profiles/<str:username>/follow/",
        ToggleFollowView.as_view(),
        name="toggle-follow",
    ),
    path(
        "profiles/<str:username>/connections/",
        FollowersFollowingView.as_view(),
        name="followers-following",
    ),
]
