FROM python:3.11-slim

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    netcat-openbsd \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Define a versão do Poetry que queremos usar (2.1.2)
ENV POETRY_VERSION=2.1.2

# Instala o Poetry usando a versão definida
RUN curl -sSL https://install.python-poetry.org | POETRY_VERSION=$POETRY_VERSION python3 - && \
    ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração do Poetry (pyproject.toml e poetry.lock)
COPY pyproject.toml poetry.lock* ./

# Configura o Poetry para não criar virtualenv e instala dependências
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

# Copia o restante dos arquivos do projeto
COPY . .

# Dá permissão de execução para o wait-for-it.sh
RUN chmod +x ./wait-for-it.sh

# Comando para rodar o Django após garantir que o banco está disponível
CMD ["./wait-for-it.sh", "db", "5432", "--", "python", "manage.py", "runserver", "0.0.0.0:8000"]
