const express = require('express');
const TONService = require('../services/ton-service');
const router = express.Router();

const tonService = new TONService();

// Получение баланса кошелька
router.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        // Валидация адреса TON
        if (!address || !address.startsWith('EQ') || address.length < 48) {
            return res.status(400).json({
                success: false,
                error: 'Invalid TON wallet address'
            });
        }

        const balance = await tonService.getBalance(address);
        
        res.json({
            success: true,
            data: {
                address,
                balance: balance,
                currency: 'TON',
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error in balance endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch balance',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Получение полной информации о кошельке
router.get('/info/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!address || !address.startsWith('EQ') || address.length < 48) {
            return res.status(400).json({
                success: false,
                error: 'Invalid TON wallet address'
            });
        }

        const walletInfo = await tonService.getWalletInfo(address);
        
        res.json({
            success: true,
            data: walletInfo
        });
    } catch (error) {
        console.error('Error in wallet info endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch wallet information'
        });
    }
});

module.exports = router;