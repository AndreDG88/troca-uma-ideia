import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from talkzone.models import Profile


# Cria um usuário e retorna instância + token de acesso.
@pytest.fixture
def create_user_and_token(db):
    user = User.objects.create_user(username="testuser", password="testpass123")
    profile = Profile.objects.get(user=user)
    profile.bio = "Bio original"
    profile.save()
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    return user, access_token


# Testa se um usuário autenticado consegue obter seu perfil com sucesso.
@pytest.mark.django_db
def test_get_my_profile_authorized(create_user_and_token):
    user, token = create_user_and_token
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.get("/api/myprofile/")
    assert response.status_code == 200
    assert response.data["bio"] == "Bio original"
    assert "avatar" in response.data
    assert "followers_count" in response.data
    assert "following_count" in response.data


# Testa se um usuário autenticado consegue atualizar sua bio com PUT.
@pytest.mark.django_db
def test_update_my_profile_bio(create_user_and_token):
    user, token = create_user_and_token
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    data = {
        "bio": "Nova bio via teste!",
    }

    response = client.patch("/api/myprofile/", data)
    assert response.status_code == 200
    assert response.data["bio"] == "Nova bio via teste!"


# Testa se acesso sem token retorna 401.
@pytest.mark.django_db
def test_get_profile_unauthenticated():
    client = APIClient()
    response = client.get("/api/myprofile/")
    assert response.status_code == 401
