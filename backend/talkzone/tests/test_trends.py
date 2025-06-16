import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from talkzone.models import Tweet


@pytest.mark.django_db
def test_trends_extracts_hashtags_only(api_client, create_user):
    user = create_user(username="trenduser", email="trend@example.com")
    client = APIClient()
    client.force_authenticate(user=user)

    tweets = [
        "Hoje é dia de #Python e #Django!",
        "Explorando #Python, #APIs e #Backend",
        "#Python é top demais!",
        "#React também é legal",
        "#django com #pytest",
        "Sem hashtag aqui",
    ]

    for content in tweets:
        Tweet.objects.create(user=user, content=content)

    response = api_client.get("/api/trends/")
    assert response.status_code == 200

    hashtags = [trend["hashtag"] for trend in response.data]
    assert "Python" in hashtags
    assert "django" in hashtags


@pytest.mark.django_db
def test_trends_ignores_blank_tweets(api_client, create_user):
    user = create_user("blankuser", "blank@example.com", "senha123")
    client = APIClient()
    client.force_authenticate(user=user)

    Tweet.objects.create(user=user, content="    ")
    Tweet.objects.create(user=user, content="#TagValida")

    response = api_client.get("/api/trends/")
    assert response.status_code == 200

    terms = [t["hashtag"] for t in response.data]
    assert "tagValida" in terms
    assert len(terms) == 1
