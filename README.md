# Full-stack Web App (FastAPI + React + Tailwind)

## Backend (FastAPI)
- Python 3.9+
- FastAPI
- Uvicorn
- SQLAlchemy
- Alembic
- python-dotenv

## Frontend (React + Vite + Tailwind)
- React
- Vite
- Tailwind CSS
- react-router-dom
- axios
- recharts

## Установка

### Backend
1. Перейдите в папку backend:
   ```sh
   cd backend
   ```
2. Создайте виртуальное окружение и активируйте его:
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Установите зависимости:
   ```sh
   pip install -r requirements.txt
   ```
4. Скопируйте .env.example в .env и настройте переменные.

### Frontend
1. Перейдите в папку frontend:
   ```sh
   cd frontend
   ```
2. Установите зависимости:
   ```sh
   npm install
   ```
3. Скопируйте .env.example в .env и настройте переменные.

## Запуск

### Backend
```sh
uvicorn main:app --reload
```

### Frontend
```sh
npm run dev
```

---

## Структура проекта
- backend/ — FastAPI backend
- frontend/ — React frontend
