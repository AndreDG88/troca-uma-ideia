FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN chmod +x ./wait-for-it.sh

CMD ["./wait-for-it.sh", "db", "5432", "--", "python", "manage.py", "runserver", "0.0.0.0:8000"]


