const TelegramBot = require('node-telegram-bot-api');

// Замените на ваш токен
const token = process.env.BOT_TOKEN || '7893850735:AAHkm_Z3hJ1z3Nj2oaczOKBkeidp6TT8MeE';
const bot = new TelegramBot(token, { polling: true });

const frontendUrl = 'https://ton-nft-frontend-test.onrender.com';

async function setupBot() {
    try {
        // Установка меню кнопки
        await bot.setChatMenuButton({
            menu_button: {
                type: 'web_app',
                text: '🎭 Open Marketplace',
                web_app: { url: frontendUrl }
            }
        });

        // Установка описания бота
        await bot.setDescription(`TON NFT Marketplace - Buy and sell NFTs with TON cryptocurrency\n\nOpen marketplace: ${frontendUrl}`);

        // Установка команд бота
        await bot.setMyCommands([
            {
                command: 'start',
                description: 'Start the bot and open marketplace'
            },
            {
                command: 'help',
                description: 'Get help about the marketplace'
            }
        ]);

        console.log('✅ Bot setup completed successfully!');
        console.log(`🌐 Web App URL: ${frontendUrl}`);

        // Обработчик команды /start
        bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            bot.sendMessage(chatId, `🎭 Welcome to TON NFT Marketplace!\n\nClick the menu button below to open the marketplace and start trading NFTs with TON cryptocurrency.`, {
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: '🚀 Open Marketplace',
                            web_app: { url: frontendUrl }
                        }
                    ]]
                }
            });
        });

        // Обработчик команды /help
        bot.onText(/\/help/, (msg) => {
            const chatId = msg.chat.id;
            bot.sendMessage(chatId, `🤖 **TON NFT Marketplace Bot Help**\n\n• Use the menu button to open the marketplace\n• Connect your TON wallet to buy/sell NFTs\n• All transactions are on TON blockchain\n• Support: @your_username`, {
                parse_mode: 'Markdown'
            });
        });

        console.log('🤖 Bot is running and ready!');

    } catch (error) {
        console.error('❌ Bot setup failed:', error);
    }
}

setupBot();