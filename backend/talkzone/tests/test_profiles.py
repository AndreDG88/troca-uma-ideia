from io import BytesIO

import pytest
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from talkzone.models import Profile


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
    print(response.status_code)
    print(response.data)
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
