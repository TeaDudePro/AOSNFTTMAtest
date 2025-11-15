// backend/src/routes/nfts.js
const express = require('express');
const TONService = require('../services/ton-service');
const router = express.Router();

const tonService = new TONService();

// Получение списка NFT из Getgems коллекции
router.get('/', async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        
        console.log(`Fetching NFTs with limit: ${limit}, offset: ${offset}`);
        
        const nfts = await tonService.getNFTs(parseInt(limit), parseInt(offset));
        const collectionInfo = await tonService.getCollectionInfo();
        
        res.json({
            success: true,
            data: {
                nfts: nfts,
                collection: collectionInfo,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: collectionInfo.itemsCount || nfts.length
                }
            }
        });
    } catch (error) {
        console.error('Error in NFTs endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch NFTs'
        });
    }
});

// Получение информации о конкретном NFT
router.get('/:nftAddress', async (req, res) => {
    try {
        const { nftAddress } = req.params;
        
        if (!nftAddress) {
            return res.status(400).json({
                success: false,
                error: 'NFT address is required'
            });
        }

        const nft = await tonService.getNFTDetails(nftAddress);
        
        if (!nft) {
            return res.status(404).json({
                success: false,
                error: 'NFT not found'
            });
        }
        
        res.json({
            success: true,
            data: nft
        });
    } catch (error) {
        console.error('Error in NFT details endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch NFT details'
        });
    }
});

// Получение информации о коллекции
router.get('/collection/info', async (req, res) => {
    try {
        const collectionInfo = await tonService.getCollectionInfo();
        
        res.json({
            success: true,
            data: collectionInfo
        });
    } catch (error) {
        console.error('Error in collection info endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch collection info'
        });
    }
});

// Получение NFT по владельцу (остается для совместимости)
router.get('/owner/:ownerAddress', async (req, res) => {
    try {
        const { ownerAddress } = req.params;
        const nfts = await tonService.getNFTsByOwner(ownerAddress);
        
        res.json({
            success: true,
            data: nfts,
            count: nfts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;