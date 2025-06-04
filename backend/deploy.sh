#!/bin/bash

echo "Iniciando deploy backend Django no PythonAnywhere..."

# Ativa o ambiente virtual
source ~/troca-uma-ideia/backend/venv/bin/activate

# Vai para a pasta onde está o manage.py
cd ~/troca-uma-ideia/backend

# Puxa as atualizações do repositório
git pull origin main

# Roda as migrações
python manage.py migrate

# Coleta os arquivos estáticos
python manage.py collectstatic --noinput

# Força reload do WSGI
touch /var/www/andredg88_pythonanywhere_com_wsgi.py

echo "Deploy finalizado com sucesso!"
