// backend/src/services/ton-service.js
const axios = require('axios');
const CacheService = require('./cache-service');
const GetgemsService = require('./getgems-service');

class TONService {
    constructor() {
        this.tonCenterUrl = 'https://toncenter.com/api/v2';
        this.tonApiUrl = 'https://tonapi.io/v2';
        this.cache = new CacheService();
        this.getgemsService = new GetgemsService();
    }

    // Получение реального баланса кошелька (остается без изменений)
    async getBalance(address) {
        // ... существующий код без изменений
        const cachedBalance = this.cache.get(`balance_${address}`);
        if (cachedBalance) {
            console.log(`Returning cached balance for ${address}`);
            return cachedBalance;
        }

        try {
            console.log(`Fetching fresh balance for address: ${address}`);
            
            const response = await axios.get(`${this.tonCenterUrl}/getAddressInformation`, {
                params: { address },
                headers: { 'Accept': 'application/json' },
                timeout: 10000
            });

            if (response.data && response.data.result) {
                const balanceNanoton = response.data.result.balance;
                const balanceTON = (balanceNanoton / 1000000000).toFixed(2);
                console.log(`Fresh balance for ${address}: ${balanceTON} TON`);
                
                this.cache.set(`balance_${address}`, balanceTON);
                return balanceTON;
            } else {
                throw new Error('Invalid response from TON API');
            }
        } catch (error) {
            console.error('Error fetching balance from TON Center:', error.message);
            
            try {
                const fallbackResponse = await axios.get(`${this.tonApiUrl}/accounts/${address}`, {
                    timeout: 10000
                });
                
                if (fallbackResponse.data && fallbackResponse.data.balance) {
                    const balanceNanoton = fallbackResponse.data.balance;
                    const balanceTON = (balanceNanoton / 1000000000).toFixed(2);
                    console.log(`Balance from fallback API: ${balanceTON} TON`);
                    
                    this.cache.set(`balance_${address}`, balanceTON);
                    return balanceTON;
                }
            } catch (fallbackError) {
                console.error('Fallback API also failed:', fallbackError.message);
            }
            
            return "0";
        }
    }

    // Получение NFT из Getgems коллекции
    async getNFTs(limit = 20, offset = 0) {
        try {
            console.log(`Fetching NFTs from Getgems collection, limit: ${limit}, offset: ${offset}`);
            const nfts = await this.getgemsService.getCollectionNFTs(limit, offset);
            return nfts;
        } catch (error) {
            console.error('Error fetching NFTs from Getgems:', error);
            // Fallback на моковые данные в случае ошибки
            return this.getMockNFTs();
        }
    }

    // Получение информации о конкретном NFT
    async getNFTDetails(nftAddress) {
        try {
            console.log(`Fetching NFT details for: ${nftAddress}`);
            const nft = await this.getgemsService.getNFTDetails(nftAddress);
            return nft;
        } catch (error) {
            console.error('Error fetching NFT details:', error);
            return null;
        }
    }

    // Получение NFT по владельцу (остается для совместимости)
    async getNFTsByOwner(ownerAddress) {
        try {
            const response = await axios.get(`${this.tonApiUrl}/accounts/${ownerAddress}/nfts`, {
                params: {
                    limit: 50,
                    offset: 0
                }
            });
            
            return response.data.nft_items.map(nft => ({
                id: nft.address,
                name: nft.metadata?.name || 'Unnamed NFT',
                description: nft.metadata?.description || '',
                image: this.parseImageUrl(nft.metadata?.image),
                collection: nft.collection?.name || 'No Collection',
                address: nft.address,
                owner: ownerAddress
            }));
        } catch (error) {
            console.error('Error fetching NFTs by owner:', error);
            return [];
        }
    }

    // Получение информации о коллекции
    async getCollectionInfo() {
        try {
            const collectionInfo = await this.getgemsService.getCollectionInfo();
            return collectionInfo;
        } catch (error) {
            console.error('Error fetching collection info:', error);
            return {
                name: "Getgems Collection",
                description: "NFT collection from Getgems",
                itemsCount: 0,
                address: 'EQCMryyDgKwd0d-ZS1UxWpP-1y-bjPnPD7KCrFhGDAKuOJnZ'
            };
        }
    }

    // Моковые данные как fallback
    getMockNFTs() {
        console.log('Using mock NFTs as fallback');
        return [
            {
                id: "mock-1",
                name: "TON Diamond NFT",
                description: "Exclusive diamond edition TON NFT",
                price: "0.5",
                image: "https://picsum.photos/300/300?random=1",
                collection: "TON Diamonds",
                address: "EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N",
                sellerAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                isOnSale: true
            },
            {
                id: "mock-2",
                name: "CryptoPunk TON Edition",
                description: "TON blockchain version of CryptoPunk",
                price: "1.2",
                image: "https://picsum.photos/300/300?random=2",
                collection: "TON Punks",
                address: "EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N",
                sellerAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                isOnSale: true
            }
        ];
    }

    parseImageUrl(image) {
        if (!image) return 'https://via.placeholder.com/300';
        
        if (image.startsWith('ipfs://')) {
            return `https://ipfs.io/ipfs/${image.replace('ipfs://', '')}`;
        }
        
        return image;
    }
}

module.exports = TONService;