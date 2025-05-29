from django.urls import path
from .views import TweetListCreateView, UserListView

urlpatterns = [
    path('tweets/', TweetListCreateView.as_view(), name='tweet-list-create'),
    path('users/', UserListView.as_view(), name='user-list'),
]
