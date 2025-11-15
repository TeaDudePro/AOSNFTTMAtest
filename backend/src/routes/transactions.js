const express = require('express');
const TransactionService = require('../services/transaction-service');
const router = express.Router();

const transactionService = new TransactionService();

// Создание транзакции покупки
router.post('/purchase', async (req, res) => {
    try {
        const { buyerAddress, sellerAddress, nftPrice, nftAddress } = req.body;
        
        // Валидация данных
        if (!buyerAddress || !sellerAddress || !nftPrice) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Создание транзакции
        const transactionResult = await transactionService.createPurchaseTransaction(
            buyerAddress, 
            sellerAddress, 
            nftPrice
        );

        if (!transactionResult.success) {
            return res.status(500).json({
                success: false,
                error: transactionResult.error
            });
        }

        // Симуляция проведения транзакции
        const simulationResult = await transactionService.simulateTransaction(transactionResult.transaction);

        res.json({
            success: simulationResult.success,
            data: {
                transactionHash: simulationResult.transactionHash,
                message: simulationResult.message,
                nftAddress: nftAddress
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Получение истории транзакций
router.get('/history/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        // Временные данные - в реальности нужно получать из блокчейна
        const mockHistory = [
            {
                id: 1,
                type: 'purchase',
                nftName: 'TON Diamond NFT',
                price: '0.5',
                timestamp: new Date().toISOString(),
                status: 'completed',
                hash: '0x1234567890abcdef'
            }
        ];
        
        res.json({
            success: true,
            data: mockHistory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;