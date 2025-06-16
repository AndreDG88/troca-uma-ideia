import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from talkzone.models import Tweet


# Confirmar que o modelo Tweet funciona corretamente com o banco de dados.
@pytest.mark.django_db
def test_create_tweet():
    user = User.objects.create_user(username="testeuser", password="senha123")
    tweet = Tweet.objects.create(
        user=user, content="Primeiro tweet de teste", is_repapo=False
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
def test_user_can_update_own_tweet(auth_client, create_user):
    user = create_user(username="andre")
    tweet = Tweet.objects.create(user=user, content="Original")

    client = APIClient()
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.put(
        f"/api/tweets/{tweet.id}/", {"content": "Editado"}, format="json"
    )
    
    assert response.status_code == 200
    assert response.data["content"] == "Editado"


# Verifica se um usuário não consegue editar tweets de outras pessoas.
@pytest.mark.django_db
def test_user_cannot_update_other_user_tweet(create_user):
    user1 = create_user(username="andre")
    user2 = create_user(username="joao")
    tweet = Tweet.objects.create(user=user2, content="Tweet do João")

    client = APIClient()
    refresh = RefreshToken.for_user(user1)
    token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.put(
        f"/api/tweets/{tweet.id}/", {"content": "Tentativa de edição"}, format="json"
    )
    assert response.status_code == 403


# Testa se um usuário pode deletar seu próprio tweet.
@pytest.mark.django_db
def test_user_can_delete_own_tweet(create_user):
    user = create_user(username="andre")
    tweet = Tweet.objects.create(user=user, content="Deletável")

    client = APIClient()
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    
    response = client.delete(f"/api/tweets/{tweet.id}/")
    assert response.status_code == 204


# Garante que um usuário não consiga deletar o tweet de outra pessoa.
@pytest.mark.django_db
def test_user_cannot_delete_other_user_tweet(create_user):
    user1 = create_user(username="andre")
    user2 = create_user(username="joao")
    tweet = Tweet.objects.create(user=user2, content="Tweet do João")

    client = APIClient()
    refresh = RefreshToken.for_user(user1)
    token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.delete(f"/api/tweets/{tweet.id}/")
    assert response.status_code == 403


# Teste de curtida em tweet
@pytest.mark.django_db
def test_toggle_like(auth_client):
    # Cria usuário e token
    user = User.objects.create_user(username="testuser", password="senha123")
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)

    # Cria tweet do mesmo usuário
    tweet = Tweet.objects.create(user=user, content="teste")

    # Autentica o cliente
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    # Chama a rota de like
    response = client.post(f"/api/tweets/{tweet.id}/like/")
    assert response.status_code == 200
    assert response.data["detail"] == "Curtida."

    response = client.post(f"/api/tweets/{tweet.id}/like/")
    assert response.status_code == 200
    assert response.data["detail"] == "Curtida removida."


# Teste de reply a outro tweet
@pytest.mark.django_db
def test_reply_to_tweet(auth_client, tweet):
    response = auth_client.post(
        "/api/tweets/", {"content": "Resposta", "reply_to_id": tweet.id}
    )
    assert response.status_code == 201
    assert response.data["reply_to"] == tweet.id


# Teste de repapo (retweet)
@pytest.mark.django_db
def test_repapear_tweet(auth_client, tweet):
    response = auth_client.post(
        "/api/tweets/", {"is_repapo": True, "original_tweet_id": tweet.id}
    )
    assert response.status_code == 201
    assert response.data["is_repapo"] is True
    assert response.data["original_tweet"]["id"] == tweet.id


# Teste de contagem de repapo
@pytest.mark.django_db
def test_repapo_count(auth_client, tweet):
    # Cria 2 repapos
    for _ in range(2):
        auth_client.post(
            "/api/tweets/", {"is_repapo": True, "original_tweet_id": tweet.id}
        )
    response = auth_client.get(f"/api/tweets/{tweet.id}/")
    assert response.status_code == 200
    assert response.data["repapear_count"] == 2


# Teste de reply encadeado
@pytest.mark.django_db
def test_nested_replies(auth_client, tweet):
    reply1 = auth_client.post(
        "/api/tweets/", {"content": "Reply 1", "reply_to_id": tweet.id}
    ).data
    reply2 = auth_client.post(
        "/api/tweets/", {"content": "Reply 2", "reply_to_id": reply1["id"]}
    ).data

    response = auth_client.get(f"/api/tweets/{tweet.id}/")
    assert response.status_code == 200
    replies = response.data["replies"]
    assert any(r["id"] == reply1["id"] for r in replies)
