import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from talkzone.models import Tweet


# Confirmar que o modelo Tweet funciona corretamente com o banco de dados.
@pytest.mark.django_db
def test_create_tweet():
    user = User.objects.create_user(username="testeuser", password="senha123")
    tweet = Tweet.objects.create(
        user=user,
        content="Primeiro tweet de teste",
        is_repapo=False
    )
    assert tweet.content == "Primeiro tweet de teste"
    assert tweet.user.username == "testeuser"


# Verifica se um usuário autenticado consegue acessar sua listagem personalizada de tweets
@pytest.mark.django_db
def test_authenticated_user_can_see_own_tweets():
    user = User.objects.create_user(username="andre", password="senha123")
    tweet = Tweet.objects.create(user=user, content="Meu tweet de teste")

    client = APIClient()
    response = client.post(
        "/api/token/", {"username": "andre", "password": "senha123"}, format="json"
    )
    token = response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.get("/api/mytweets/")

    assert response.status_code == 200
    assert response.data[0]["content"] == "Meu tweet de teste"


# Confirmar que a API está protegida e permite apenas ações autenticadas de criação.
@pytest.mark.django_db
def test_authenticated_user_can_create_tweet():
    user = User.objects.create_user(username="joao", password="senha123")
    client = APIClient()

    response = client.post(
        "/api/token/", {"username": "joao", "password": "senha123"}, format="json"
    )
    token = response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.post(
        "/api/tweets/", {"content": "Um tweet via API"}, format="json"
    )

    assert response.status_code == 201
    assert response.data["content"] == "Um tweet via API"


# Verifica se usuários não autenticados são impedidos de criar tweets.
@pytest.mark.django_db
def test_unauthenticated_user_cannot_create_tweet():
    client = APIClient()

    response = client.post(
        "/api/tweets/", {"content": "Tentativa não autenticada"}, format="json"
    )

    assert response.status_code in [401, 403]


# Garante que um usuário autenticado pode editar um tweet que ele mesmo criou.
@pytest.mark.django_db
def test_user_can_update_own_tweet():
    user = User.objects.create_user(username="andre", password="senha123")
    tweet = Tweet.objects.create(user=user, content="Original")

    client = APIClient()
    response = client.post(
        "/api/token/", {"username": "andre", "password": "senha123"}, format="json"
    )
    token = response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.put(
        f"/api/tweets/{tweet.id}/", {"content": "Editado"}, format="json"
    )
    assert response.status_code == 200
    assert response.data["content"] == "Editado"


# Verifica se um usuário não consegue editar tweets de outras pessoas.
@pytest.mark.django_db
def test_user_cannot_update_other_user_tweet():
    user1 = User.objects.create_user(username="andre", password="senha123")
    user2 = User.objects.create_user(username="joao", password="senha456")
    tweet = Tweet.objects.create(user=user2, content="Tweet do João")

    client = APIClient()
    response = client.post(
        "/api/token/", {"username": "andre", "password": "senha123"}, format="json"
    )
    token = response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.put(
        f"/api/tweets/{tweet.id}/", {"content": "Tentativa de edição"}, format="json"
    )
    assert response.status_code == 403


# Testa se um usuário pode deletar seu próprio tweet.
@pytest.mark.django_db
def test_user_can_delete_own_tweet():
    user = User.objects.create_user(username="andre", password="senha123")
    tweet = Tweet.objects.create(user=user, content="Deletável")

    client = APIClient()
    response = client.post(
        "/api/token/", {"username": "andre", "password": "senha123"}, format="json"
    )
    token = response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.delete(f"/api/tweets/{tweet.id}/")
    assert response.status_code == 204


# Garante que um usuário não consiga deletar o tweet de outra pessoa.
@pytest.mark.django_db
def test_user_cannot_delete_other_user_tweet():
    user1 = User.objects.create_user(username="andre", password="senha123")
    user2 = User.objects.create_user(username="joao", password="senha456")
    tweet = Tweet.objects.create(user=user2, content="Tweet do João")

    client = APIClient()
    response = client.post(
        "/api/token/", {"username": "andre", "password": "senha123"}, format="json"
    )
    token = response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.delete(f"/api/tweets/{tweet.id}/")
    assert response.status_code == 403
