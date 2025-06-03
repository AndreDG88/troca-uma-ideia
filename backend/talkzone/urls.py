from django.urls import path

from .views import (
    MyTweetsView, TweetDetailView, TweetListCreateView,
    UserListCreateView, UserDetailView, ProfileView, MyProfileView
)

urlpatterns = [
    path("tweets/", TweetListCreateView.as_view(), name="tweet-list-create"),
    path("users/", UserListCreateView.as_view(), name="user-list-create"),
    path("tweets/<int:pk>/", TweetDetailView.as_view(), name="tweet-detail"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("mytweets/", MyTweetsView.as_view(), name="my-tweets"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("myprofile/", MyProfileView.as_view(), name="my-profile"),
]
