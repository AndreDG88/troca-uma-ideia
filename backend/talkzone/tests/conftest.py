import uuid

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from talkzone.models import Profile


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(db):
    def _create_user(username=None, email=None, password="senha123"):
        if not username:
            username = f"user_{uuid.uuid4().hex[:6]}"
        if not email:
            email = f"{username}@example.com"
        user = User.objects.create_user(
            username=username, email=email, password=password
        )
        Profile.objects.get_or_create(user=user)
        return user

    return _create_user


@pytest.fixture
def auth_client(create_user):
    user = create_user()
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    return client


@pytest.fixture
def tweet(create_user):
    from talkzone.models import Tweet

    user = create_user()
    return Tweet.objects.create(user=user, content="Tweet de teste")
