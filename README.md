# Troca uma ideia!

Desenvolvido por André Silva Soares, como projeto final do curso de Desenvolvedor Fullstack Python pela EBAC - Escola Britânica de Artes Criativas e Tecnologia.

Uma rede social minimalista e responsiva que permite aos usuários criarem perfis, publicarem mensagens curtas (papos), seguir outras pessoas, curtir postagens, fazer rePapos e acompanhar tendências.

---

## Funcionalidades principais

- Autenticação em token com login e cadastro de usuários
- Perfis de usuário com foto de avatar
- Sistema completo de mensagens (papos)
- Curtir e descurtir papos
- RePapear (compartilhar papo com ou sem comentário)
- Seguir e deixar de seguir usuários
- Listagem de tendências com base nas hashtags mais utilizadas
- Interface web responsiva e mobile-first
- Backend em Django REST Framework
- Frontend em React + TypeScript
- Deploy completo: API no PythonAnywhere, frontend na Vercel

---

## Tecnologias utilizadas

### Backend
- Python 3.11
- Django 4.x
- Django REST Framework
- PostgreSQL
- SimpleJWT (autenticação)
- Poetry (gerenciamento de dependências)
- Docker (ambiente de desenvolvimento)
- Deploy: PythonAnywhere

### Frontend
- React + TypeScript
- Vite
- React Router DOM
- CSS Modules
- Deploy: Vercel

---

## Como executar localmente

### Pré-requisitos
- Node.js 18+
- Python 3.11+
- PostgreSQL (ou SQLite para testes locais)
- Docker (opcional)

### 1. Clonar o repositório

```bash
git clone https://github.com/AndreDG88/troca-uma-ideia.git
cd troca-uma-ideia

### 2. Backend (Django)

cd backend
poetry install
poetry shell
python manage.py migrate
python manage.py runserver

A API estará disponível em: http://localhost:8000

### 3. Frontend (React)

cd frontend
npm install
npm run dev

O frontend estará disponível em: http://localhost:5173

## Deploy

API (Django): AndreDG88.pythonanywhere.com

Frontend (React): [link da Vercel quando disponível]




