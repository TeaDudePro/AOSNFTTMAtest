// frontend/src/components/NFTList.js
import React, { useState } from 'react';
import NFTCard from './NFTCard';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';

const NFTList = ({ nfts, userAddress, userBalance, loading, pagination, onLoadMore }) => {
    const [processingTransaction, setProcessingTransaction] = useState(null);
    const [transactionStatus, setTransactionStatus] = useState(null);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const handleBuy = async (nft) => {
        if (!userAddress) {
            setTransactionStatus({ 
                type: 'error', 
                message: 'Please connect your wallet first!' 
            });
            return;
        }

        // Проверяем достаточно ли баланса
        if (userBalance && parseFloat(userBalance) < parseFloat(nft.price)) {
            setTransactionStatus({ 
                type: 'error', 
                message: `Insufficient balance! You need ${nft.price} TON but have only ${userBalance} TON.` 
            });
            return;
        }

        // Проверяем продается ли NFT
        if (!nft.isOnSale) {
            setTransactionStatus({ 
                type: 'error', 
                message: 'This NFT is not currently for sale.' 
            });
            return;
        }

        setProcessingTransaction(nft.id);
        setTransactionStatus({ type: 'info', message: 'Processing transaction...' });

        try {
            const response = await fetch('http://localhost:3001/api/transactions/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    buyerAddress: userAddress,
                    sellerAddress: nft.sellerAddress || nft.owner,
                    nftPrice: nft.price,
                    nftAddress: nft.address
                })
            });

            const result = await response.json();

            if (result.success) {
                setTransactionStatus({ 
                    type: 'success', 
                    message: `🎉 Successfully purchased ${nft.name}!` 
                });
                
                if (window.Telegram && window.Telegram.WebApp) {
                    window.Telegram.WebApp.showPopup({
                        title: 'Purchase Successful! 🎉',
                        message: `You bought "${nft.name}" for ${nft.price} TON`,
                        buttons: [{ type: 'ok' }]
                    });
                }

                setTimeout(() => {
                    setTransactionStatus(null);
                }, 5000);
            } else {
                setTransactionStatus({ 
                    type: 'error', 
                    message: `❌ Transaction failed: ${result.error}` 
                });
            }
        } catch (error) {
            setTransactionStatus({ 
                type: 'error', 
                message: `🌐 Network error: ${error.message}` 
            });
        } finally {
            setProcessingTransaction(null);
        }
    };

    const handleViewDetails = (nft) => {
        setSelectedNFT(nft);
        setShowDetailsModal(true);
    };

    const canLoadMore = pagination && (pagination.offset + pagination.limit) < pagination.total;

    if (loading && nfts.length === 0) {
        return <LoadingSpinner message="Loading NFTs from Getgems..." />;
    }

    if (!nfts || nfts.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">🖼️</div>
                <h3>No NFTs Found</h3>
                <p>There are no NFTs available in this collection at the moment.</p>
            </div>
        );
    }

    return (
        <div className="nft-list">
            {transactionStatus && (
                <div className={`transaction-status ${transactionStatus.type}`}>
                    {transactionStatus.message}
                </div>
            )}
            
            {userAddress && userBalance !== null && (
                <div className="balance-check">
                    <div className="balance-summary">
                        Your balance: <strong>{userBalance} TON</strong>
                    </div>
                </div>
            )}

            <div className="nfts-grid">
                {nfts.map(nft => (
                    <NFTCard 
                        key={nft.id} 
                        nft={nft}
                        userAddress={userAddress}
                        userBalance={userBalance}
                        onBuy={handleBuy}
                        onViewDetails={handleViewDetails}
                    />
                ))}
            </div>

            {loading && nfts.length > 0 && (
                <div className="loading-more">
                    <LoadingSpinner message="Loading more NFTs..." />
                </div>
            )}

            {canLoadMore && !loading && (
                <div className="load-more-section">
                    <button 
                        className="load-more-button"
                        onClick={onLoadMore}
                    >
                        Load More NFTs
                    </button>
                    <p className="pagination-info">
                        Showing {nfts.length} of {pagination.total} NFTs
                    </p>
                </div>
            )}

            <Modal 
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title={selectedNFT?.name}
            >
                {selectedNFT && (
                    <div className="nft-details">
                        <img 
                            src={selectedNFT.image} 
                            alt={selectedNFT.name}
                            className="details-image"
                        />
                        <div className="details-content">
                            <p className="details-description">{selectedNFT.description}</p>
                            
                            <div className="details-meta">
                                <div className="meta-item">
                                    <strong>Collection:</strong>
                                    <span>{selectedNFT.collection}</span>
                                </div>
                                <div className="meta-item">
                                    <strong>Status:</strong>
                                    <span className={selectedNFT.isOnSale ? 'on-sale' : 'not-for-sale'}>
                                        {selectedNFT.isOnSale ? '🟢 For Sale' : '🔴 Not for Sale'}
                                    </span>
                                </div>
                                {selectedNFT.isOnSale && (
                                    <div className="meta-item">
                                        <strong>Price:</strong>
                                        <span className="price-tag">{selectedNFT.price} TON</span>
                                    </div>
                                )}
                                {userAddress && userBalance !== null && selectedNFT.isOnSale && (
                                    <div className="meta-item">
                                        <strong>Your Balance:</strong>
                                        <span className={parseFloat(userBalance) >= parseFloat(selectedNFT.price) ? 'sufficient-balance' : 'insufficient-balance'}>
                                            {userBalance} TON
                                        </span>
                                    </div>
                                )}
                            </div>

                            {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                                <div className="attributes-section">
                                    <h4>Attributes</h4>
                                    <div className="attributes-grid">
                                        {selectedNFT.attributes.map((attr, index) => (
                                            <div key={index} className="attribute-item">
                                                <span className="attribute-trait">{attr.traitType}</span>
                                                <span className="attribute-value">{attr.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedNFT.externalUrl && (
                                <div className="external-link">
                                    <a 
                                        href={selectedNFT.externalUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="external-button"
                                    >
                                        View on Getgems ↗
                                    </a>
                                </div>
                            )}

                            <button 
                                className={`buy-button large ${!selectedNFT.isOnSale || parseFloat(userBalance) < parseFloat(selectedNFT.price) ? 'disabled' : ''}`}
                                onClick={() => {
                                    if (selectedNFT.isOnSale) {
                                        handleBuy(selectedNFT);
                                    }
                                    setShowDetailsModal(false);
                                }}
                                disabled={!userAddress || !selectedNFT.isOnSale || parseFloat(userBalance) < parseFloat(selectedNFT.price)}
                            >
                                {!userAddress 
                                    ? 'Connect Wallet to Buy' 
                                    : !selectedNFT.isOnSale
                                    ? 'Not for Sale'
                                    : parseFloat(userBalance) < parseFloat(selectedNFT.price)
                                    ? `Insufficient Balance (Need ${selectedNFT.price} TON)`
                                    : `Buy for ${selectedNFT.price} TON`
                                }
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NFTList;