#!/bin/bash

LOGFILE=/tmp/deploy.log
echo "Iniciando deploy backend Django no PythonAnywhere..." > $LOGFILE

# Ativa o ambiente virtual
source /home/AndreDG88/troca-uma-ideia/backend/venv/bin/activate >> $LOGFILE 2>&1

# Vai para a pasta onde está o manage.py
cd /home/AndreDG88/troca-uma-ideia/backend >> $LOGFILE 2>&1

# Puxa as atualizações do repositório
git pull origin main >> $LOGFILE 2>&1

# Roda as migrações
python manage.py migrate >> $LOGFILE 2>&1

# Coleta os arquivos estáticos
python manage.py collectstatic --noinput >> $LOGFILE 2>&1

# Força reload do WSGI
touch /var/www/andredg88_pythonanywhere_com_wsgi.py >> $LOGFILE 2>&1

echo "Deploy finalizado com sucesso!" >> $LOGFILE 2>&1
