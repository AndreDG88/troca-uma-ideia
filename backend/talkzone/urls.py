from django.urls import path
from .views import TweetDetailView, TweetListCreateView, UserListView, MyTweetsView

urlpatterns = [
    path('tweets/', TweetListCreateView.as_view(), name='tweet-list-create'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('tweets/<int:pk>/', TweetDetailView.as_view(), name='tweet-detail'),
    path('mytweets/', MyTweetsView.as_view(), name='my-tweets'),
]
