# make up              = Sobe os containers
# make down            = Derruba os containers
# make test            = Executa os testes com pytest
# make shell           = Entra no bash do container backend
# make migrate         = Roda as migrations
# make createsuperuser = Cria superusuário no Django

# Variáveis
COMPOSE=docker-compose
SERVICE=backend

# Comandos
up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f $(SERVICE)

build:
	$(COMPOSE) build

shell:
	$(COMPOSE) exec $(SERVICE) bash

migrate:
	$(COMPOSE) exec $(SERVICE) poetry run python manage.py migrate

makemigrations:
	$(COMPOSE) exec $(SERVICE) poetry run python manage.py makemigrations

createsuperuser:
	$(COMPOSE) exec $(SERVICE) poetry run python manage.py createsuperuser

run:
	$(COMPOSE) exec $(SERVICE) poetry run python manage.py runserver 0.0.0.0:8000

test:
	$(COMPOSE) exec $(SERVICE) poetry run pytest

test-cov:
	$(COMPOSE) exec $(SERVICE) poetry run pytest --cov

collectstatic:
	$(COMPOSE) exec $(SERVICE) poetry run python manage.py collectstatic --noinput

format:
	$(COMPOSE) exec $(SERVICE) poetry run black .

check:
	$(COMPOSE) exec $(SERVICE) poetry check

install:
	$(COMPOSE) exec $(SERVICE) poetry install

restart:
	$(MAKE) down
	$(MAKE) up
