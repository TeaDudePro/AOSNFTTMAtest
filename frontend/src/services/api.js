// frontend/src/services/api.js
class ApiService {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    }

    async fetchBalance(address) {
        try {
            const response = await fetch(`${this.baseURL}/api/wallet/balance/${address}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch balance');
            }
            
            return data.data;
        } catch (error) {
            console.error('API Service - Error fetching balance:', error);
            throw error;
        }
    }

    async fetchWalletInfo(address) {
        try {
            const response = await fetch(`${this.baseURL}/api/wallet/info/${address}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch wallet info');
            }
            
            return data.data;
        } catch (error) {
            console.error('API Service - Error fetching wallet info:', error);
            throw error;
        }
    }

    // Новые методы для работы с NFT
    async fetchNFTs(limit = 20, offset = 0) {
        try {
            const response = await fetch(`${this.baseURL}/api/nfts?limit=${limit}&offset=${offset}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch NFTs');
            }
            
            return data.data;
        } catch (error) {
            console.error('API Service - Error fetching NFTs:', error);
            throw error;
        }
    }

    async fetchNFTDetails(nftAddress) {
        try {
            const response = await fetch(`${this.baseURL}/api/nfts/${nftAddress}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
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
            const response = await fetch(`${this.baseURL}/api/nfts/collection/info`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
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