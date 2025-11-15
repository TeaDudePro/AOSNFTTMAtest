// backend/src/services/getgems-service.js
const axios = require('axios');

class GetgemsService {
    constructor() {
        this.baseURL = 'https://api.getgems.io/graphql';
        this.collectionAddress = 'EQCMryyDgKwd0d-ZS1UxWpP-1y-bjPnPD7KCrFhGDAKuOJnZ';
        this.fallbackURL = 'https://tonapi.io/v2';
    }

    // Основной метод получения NFT коллекции
    async getCollectionNFTs(limit = 20, offset = 0) {
        try {
            console.log(`Fetching NFTs from Getgems, limit: ${limit}, offset: ${offset}`);
            
            // Пробуем GraphQL запрос к Getgems
            const nfts = await this.getGemsGraphQL(limit, offset);
            if (nfts && nfts.length > 0) {
                return nfts;
            }
            
            // Если GraphQL не сработал, пробуем TON API как fallback
            console.log('Getgems GraphQL failed, trying TON API...');
            return await this.getTONApiNFTs(limit, offset);
            
        } catch (error) {
            console.error('Both Getgems and TON API failed:', error.message);
            // Возвращаем пустой массив, чтобы фронтенд мог показать fallback
            return [];
        }
    }

    // GraphQL запрос к Getgems
    async getGemsGraphQL(limit, offset) {
        try {
            const query = `
                query GetCollectionItems($collectionAddress: String!, $limit: Int!, $offset: Int!) {
                    nftItems(
                        filter: { 
                            collection: { 
                                address: { 
                                    eq: $collectionAddress 
                                } 
                            } 
                        }
                        first: $limit
                        offset: $offset
                    ) {
                        edges {
                            node {
                                address
                                name
                                description
                                collection {
                                    name
                                    address
                                }
                                owner {
                                    address
                                }
                                sale {
                                    fullPrice
                                }
                                content {
                                    image {
                                        medium
                                    }
                                }
                                attributes {
                                    traitType
                                    value
                                }
                            }
                        }
                    }
                }
            `;

            const variables = {
                collectionAddress: this.collectionAddress,
                limit: limit,
                offset: offset
            };

            const response = await axios.post(this.baseURL, {
                query: query,
                variables: variables
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 15000
            });

            console.log('Getgems GraphQL response status:', response.status);

            if (response.data.errors) {
                console.error('GraphQL errors:', response.data.errors);
                return null;
            }

            if (!response.data.data || !response.data.data.nftItems) {
                console.warn('No nftItems in GraphQL response');
                return null;
            }

            const nfts = response.data.data.nftItems.edges.map(edge => {
                return this.transformNFTData(edge.node);
            }).filter(nft => nft !== null);

            console.log(`Successfully fetched ${nfts.length} NFTs from Getgems`);
            return nfts;

        } catch (error) {
            console.error('Getgems GraphQL failed:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            return null;
        }
    }

    // Fallback через TON API
    async getTONApiNFTs(limit, offset) {
        try {
            console.log('Fetching NFTs from TON API...');
            
            const response = await axios.get(`${this.fallbackURL}/accounts/${this.collectionAddress}/nfts`, {
                params: {
                    limit: limit,
                    offset: offset,
                    indirect_ownership: false
                },
                timeout: 15000
            });

            console.log('TON API response status:', response.status);

            if (!response.data || !response.data.nft_items) {
                console.warn('No nft_items in TON API response');
                return this.getMockNFTs();
            }

            const nfts = response.data.nft_items.map(nft => {
                return this.transformTONApiData(nft);
            }).filter(nft => nft !== null);

            console.log(`Successfully fetched ${nfts.length} NFTs from TON API`);
            return nfts;

        } catch (error) {
            console.error('TON API failed:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            return this.getMockNFTs();
        }
    }

    // Трансформация данных из Getgems GraphQL
    transformNFTData(nftData) {
        if (!nftData) return null;

        try {
            // Безопасное извлечение цены
            let price = "0.00";
            let isOnSale = false;
            
            if (nftData.sale && nftData.sale.fullPrice) {
                price = (nftData.sale.fullPrice / 1000000000).toFixed(2);
                isOnSale = true;
            }

            // Безопасное извлечение изображения
            let image = 'https://via.placeholder.com/300';
            if (nftData.content && nftData.content.image) {
                image = nftData.content.image.medium || 
                       nftData.content.image.large || 
                       nftData.content.image.small || 
                       image;
            }

            return {
                id: nftData.address || `nft-${Date.now()}-${Math.random()}`,
                name: nftData.name || 'Unnamed NFT',
                description: nftData.description || 'No description available',
                price: price,
                image: image,
                collection: nftData.collection?.name || 'Getgems Collection',
                address: nftData.address || '',
                owner: nftData.owner?.address,
                sellerAddress: nftData.owner?.address,
                attributes: nftData.attributes || [],
                isOnSale: isOnSale,
                externalUrl: nftData.address ? 
                    `https://getgems.io/collection/${this.collectionAddress}/${nftData.address}` : 
                    null
            };
        } catch (error) {
            console.error('Error transforming NFT data:', error);
            return null;
        }
    }

    // Трансформация данных из TON API
    transformTONApiData(nftData) {
        if (!nftData) return null;

        try {
            return {
                id: nftData.address,
                name: nftData.metadata?.name || 'Unnamed NFT',
                description: nftData.metadata?.description || 'No description available',
                price: "0.00", // TON API не предоставляет информацию о ценах
                image: this.parseImageUrl(nftData.metadata?.image),
                collection: nftData.collection?.name || 'Getgems Collection',
                address: nftData.address,
                owner: nftData.owner?.address,
                sellerAddress: nftData.owner?.address,
                attributes: nftData.metadata?.attributes || [],
                isOnSale: false, // TON API не предоставляет информацию о продажах
                externalUrl: `https://getgems.io/collection/${this.collectionAddress}/${nftData.address}`
            };
        } catch (error) {
            console.error('Error transforming TON API NFT data:', error);
            return null;
        }
    }

    // Моковые данные как последний fallback
    getMockNFTs() {
        console.log('Using mock NFTs as final fallback');
        return [
            {
                id: "mock-1",
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
                id: "mock-2",
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
            },
            {
                id: "mock-3",
                name: "Digital Art #001",
                description: "Unique digital art piece from Getgems collection",
                price: "0.8",
                image: "https://picsum.photos/300/300?random=3",
                collection: "Getgems Collection",
                address: "EQCk3...mock3",
                sellerAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                isOnSale: false,
                attributes: [
                    { traitType: "Rarity", value: "Common" },
                    { traitType: "Art Style", value: "Abstract" }
                ]
            }
        ];
    }

    parseImageUrl(image) {
        if (!image) return 'https://via.placeholder.com/300';
        
        if (image.startsWith('ipfs://')) {
            const ipfsHash = image.replace('ipfs://', '');
            return `https://ipfs.io/ipfs/${ipfsHash}`;
        }
        
        // Если это относительный URL, преобразуем в абсолютный
        if (image.startsWith('/')) {
            return `https://getgems.io${image}`;
        }
        
        return image;
    }

    // Получение информации о коллекции
    async getCollectionInfo() {
        try {
            // Пробуем получить информацию через TON API
            const response = await axios.get(`${this.fallbackURL}/accounts/${this.collectionAddress}`, {
                timeout: 10000
            });

            if (response.data) {
                return {
                    name: response.data.name || "Getgems NFT Collection",
                    description: response.data.description || "NFT collection from Getgems marketplace",
                    address: this.collectionAddress,
                    itemsCount: response.data.memo || "1000+", // TON API не всегда предоставляет точное количество
                    owner: response.data.owner?.address
                };
            }
        } catch (error) {
            console.error('Error fetching collection info:', error.message);
        }

        // Fallback информация
        return {
            name: "Getgems NFT Collection",
            description: "Popular NFT collection on TON blockchain",
            address: this.collectionAddress,
            itemsCount: "1000+",
            owner: null
        };
    }
}

module.exports = GetgemsService;