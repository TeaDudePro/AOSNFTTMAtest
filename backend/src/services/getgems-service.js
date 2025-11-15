const axios = require('axios');

class GetgemsService {
    constructor() {
        this.baseURL = 'https://api.getgems.io/graphql';
        this.collectionAddress = 'EQCMryyDgKwd0d-ZS1UxWpP-1y-bjPnPD7KCrFhGDAKuOJnZ';
    }

    // GraphQL запрос для получения NFT коллекции
    async getCollectionNFTs(limit = 20, offset = 0) {
        try {
            const query = `
                query GetCollectionItems($collectionAddress: String!, $limit: Int!, $offset: Int!) {
                    nftItemsByCollection(
                        collection: $collectionAddress
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
                timeout: 10000
            });

            if (response.data.errors) {
                console.error('GraphQL errors:', response.data.errors);
                throw new Error('GraphQL query failed');
            }

            const nfts = response.data.data.nftItemsByCollection.edges.map(edge => {
                const node = edge.node;
                return this.transformNFTData(node);
            });

            console.log(`Fetched ${nfts.length} NFTs from Getgems`);
            return nfts;

        } catch (error) {
            console.error('Error fetching NFTs from Getgems:', error.message);
            throw new Error(`Failed to fetch NFTs: ${error.message}`);
        }
    }

    // Получение информации о конкретном NFT
    async getNFTDetails(nftAddress) {
        try {
            const query = `
                query GetNFTItem($nftAddress: String!) {
                    nftItem(address: $nftAddress) {
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
                                large
                            }
                        }
                        attributes {
                            traitType
                            value
                        }
                    }
                }
            `;

            const variables = {
                nftAddress: nftAddress
            };

            const response = await axios.post(this.baseURL, {
                query: query,
                variables: variables
            });

            if (response.data.errors) {
                throw new Error('GraphQL query failed for NFT details');
            }

            return this.transformNFTData(response.data.data.nftItem);

        } catch (error) {
            console.error('Error fetching NFT details from Getgems:', error);
            throw new Error(`Failed to fetch NFT details: ${error.message}`);
        }
    }

    // Трансформация данных из Getgems в наш формат
    transformNFTData(nftData) {
        if (!nftData) return null;

        // Конвертируем цену из нанотоннов в TON
        const price = nftData.sale ? (nftData.sale.fullPrice / 1000000000).toFixed(2) : "0.00";

        return {
            id: nftData.address,
            name: nftData.name || 'Unnamed NFT',
            description: nftData.description || 'No description available',
            price: price,
            image: nftData.content?.image?.medium || nftData.content?.image?.large || 'https://via.placeholder.com/300',
            collection: nftData.collection?.name || 'Unknown Collection',
            address: nftData.address,
            owner: nftData.owner?.address,
            sellerAddress: nftData.owner?.address,
            attributes: nftData.attributes || [],
            isOnSale: !!nftData.sale,
            externalUrl: `https://getgems.io/collection/${this.collectionAddress}/${nftData.address}`
        };
    }

    // Получение информации о коллекции
    async getCollectionInfo() {
        try {
            const query = `
                query GetCollection($collectionAddress: String!) {
                    nftCollection(address: $collectionAddress) {
                        name
                        description
                        address
                        itemsCount
                        owner {
                            address
                        }
                    }
                }
            `;

            const variables = {
                collectionAddress: this.collectionAddress
            };

            const response = await axios.post(this.baseURL, {
                query: query,
                variables: variables
            });

            if (response.data.errors) {
                throw new Error('GraphQL query failed for collection info');
            }

            return response.data.data.nftCollection;

        } catch (error) {
            console.error('Error fetching collection info:', error);
            throw new Error(`Failed to fetch collection info: ${error.message}`);
        }
    }
}

module.exports = GetgemsService;