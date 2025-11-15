const TelegramBot = require('node-telegram-bot-api');

const token = '7893850735:AAHkm_Z3hJ1z3Nj2oaczOKBkeidp6TT8MeE';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать в NFT маркетплейс! Используйте кнопку меню для запуска.', {
        reply_markup: {
            keyboard: [[{ text: "🎭 Open Marketplace", web_app: { url: "https://your-app.vercel.app" } }]],
            resize_keyboard: true
        }
    });
});

console.log('Bot is running...');