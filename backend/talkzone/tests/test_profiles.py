from io import BytesIO

import pytest
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from talkzone.models import Profile


@pytest.fixture
def create_user_and_token(db):
    user = User.objects.create_user(username="testuser2", password="testpass123")
    Profile.objects.get_or_create(user=user)
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    return user, token


@pytest.mark.django_db
def test_profile_is_created_with_user():
    user = User.objects.create_user(username="testeuser", password="123456")
    assert Profile.objects.filter(user=user).exists()


@pytest.mark.django_db
def test_avatar_upload_and_retrieval(create_user_and_token):
    user, token = create_user_and_token
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    # Simula um arquivo PNG válido pequeno (1x1 pixel)
    image = Image.new("RGB", (1, 1), color="white")
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    avatar = SimpleUploadedFile("avatar.png", buffer.read(), content_type="image/png")

    data = {"avatar": avatar, "bio": ""}
    response = client.patch("/api/myprofile/", data, format="multipart")
    assert response.status_code == 200
    assert "avatar" in response.data


@pytest.mark.django_db
def test_user_serializer_includes_profile():
    user = User.objects.create_user(username="seruser", password="123456")
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(f"/api/users/{user.id}/")
    assert response.status_code == 200
    assert "profile" in response.data
    assert "avatar" in response.data["profile"]
    assert "followers_count" in response.data["profile"]
    assert "following_count" in response.data["profile"]


@pytest.mark.django_db
def test_toggle_follow(api_client, create_user):
    user1 = create_user(username="user1", email="user1@example.com")
    user2 = create_user(username="user2", email="user2@example.com")

    client = APIClient()
    client.force_authenticate(user=user1)

    # Segue user2
    response = client.post(f"/api/profiles/{user2.username}/follow/")
    assert response.status_code == 200
    assert response.data["following"] is True

    # Verifica se user1 está nos followers de user2
    user2.refresh_from_db()
    assert user1.profile in user2.profile.followers.all()

    # Deixa de seguir user2
    response = client.post(f"/api/profiles/{user2.username}/follow/")
    assert response.status_code == 200
    assert response.data["following"] is False

    user2.refresh_from_db()
    assert user1.profile not in user2.profile.followers.all()


@pytest.mark.django_db
def test_toggle_follow_self(api_client, create_user):
    user = create_user("user", "user@example.com", "senha123")

    client = APIClient()
    client.force_authenticate(user=user)

    # Tenta seguir a si mesmo (deve retornar erro 400 ou ser ignorado)
    response = client.post(f"/api/profiles/{user.username}/follow/")
    assert response.status_code in (400, 200)
    if response.status_code == 200:
        assert response.data["following"] is False
