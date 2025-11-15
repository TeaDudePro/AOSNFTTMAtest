# Деплой TON NFT Marketplace на Render

## Backend Деплой
1. Создайте новый Web Service на Render
2. Подключите GitHub репозиторий
3. Настройки:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: 18+

## Frontend Деплой
1. Создайте новый Static Site на Render
2. Подключите GitHub репозиторий
3. Настройки:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

## Environment Variables
### Backend
- `NODE_ENV=production`
- `PORT=10000`

### Frontend
- `REACT_APP_API_URL=https://your-backend-url.onrender.com`