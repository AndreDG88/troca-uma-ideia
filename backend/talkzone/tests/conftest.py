import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from talkzone.models import Profile


@pytest.fixture
def create_user_and_token(db):
    user = User.objects.create_user(username="testuser", password="testpass123")
    profile = Profile.objects.get(user=user)
    profile.bio = "Bio original"
    profile.save()
    return user


@pytest.fixture
def create_user_and_token(db):
    user = User.objects.create_user(username="testuser", password="testpass123")
    profile = Profile.objects.get(user=user)
    profile.bio = "Bio original"
    profile.save()
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    return user, access_token


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(create_user_and_token):
    user, access_token = create_user_and_token
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    return client
