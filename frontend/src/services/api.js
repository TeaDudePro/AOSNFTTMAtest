// frontend/src/services/api.js
class ApiService {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        this.timeout = 15000; // 15 секунд timeout
    }

    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    async fetchBalance(address) {
        try {
            const data = await this.fetchWithTimeout(`${this.baseURL}/api/wallet/balance/${address}`);
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch balance');
            }
            
            return data.data;
        } catch (error) {
            console.error('API Service - Error fetching balance:', error);
            throw error;
        }
    }

    async fetchNFTs(limit = 12, offset = 0) {
        try {
            const data = await this.fetchWithTimeout(`${this.baseURL}/api/nfts?limit=${limit}&offset=${offset}`);
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch NFTs');
            }
            
            return data.data;
        } catch (error) {
            console.error('API Service - Error fetching NFTs:', error);
            // В случае ошибки возвращаем fallback данные
            return this.getFallbackNFTs(limit);
        }
    }

    // Fallback данные для NFT
    getFallbackNFTs(limit) {
        const mockNFTs = [
            {
                id: "fallback-1",
                name: "TON Diamond NFT",
                description: "Exclusive diamond edition TON NFT from Getgems collection",
                price: "0.5",
                image: "https://picsum.photos/300/300?random=1",
                collection: "Getgems Collection",
                address: "EQCk3...mock1",
                sellerAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                isOnSale: true,
                attributes: [
                    { traitType: "Rarity", value: "Rare" },
                    { traitType: "Background", value: "Blue" }
                ]
            },
            {
                id: "fallback-2",
                name: "CryptoPunk TON Edition",
                description: "TON blockchain version of the iconic CryptoPunk",
                price: "1.2",
                image: "https://picsum.photos/300/300?random=2",
                collection: "Getgems Collection", 
                address: "EQCk3...mock2",
                sellerAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                isOnSale: true,
                attributes: [
                    { traitType: "Rarity", value: "Epic" },
                    { traitType: "Type", value: "Punk" }
                ]
            }
        ];
        
        return {
            nfts: mockNFTs.slice(0, limit),
            collection: {
                name: "Getgems Collection",
                description: "NFT collection from Getgems",
                itemsCount: mockNFTs.length,
                address: 'EQCMryyDgKwd0d-ZS1UxWpP-1y-bjPnPD7KCrFhGDAKuOJnZ'
            },
            pagination: {
                limit: limit,
                offset: 0,
                total: mockNFTs.length
            }
        };
    }

    // Остальные методы остаются без изменений
    async fetchWalletInfo(address) {
        try {
            const data = await this.fetchWithTimeout(`${this.baseURL}/api/wallet/info/${address}`);
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch wallet info');
            }
            
            return data.data;
        } catch (error) {
            console.error('API Service - Error fetching wallet info:', error);
            throw error;
        }
    }

    async fetchNFTDetails(nftAddress) {
        try {
            const data = await this.fetchWithTimeout(`${this.baseURL}/api/nfts/${nftAddress}`);
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch NFT details');
            }
            
            return data.data;
        } catch (error) {
            console.error('API Service - Error fetching NFT details:', error);
            throw error;
        }
    }

    async fetchCollectionInfo() {
        try {
            const data = await this.fetchWithTimeout(`${this.baseURL}/api/nfts/collection/info`);
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch collection info');
            }
            
            return data.data;
        } catch (error) {
            console.error('API Service - Error fetching collection info:', error);
            throw error;
        }
    }
}

// Создаем singleton instance
const apiService = new ApiService();
export default apiService;