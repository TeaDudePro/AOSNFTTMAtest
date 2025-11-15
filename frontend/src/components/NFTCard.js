// frontend/src/components/NFTCard.js
import React, { useState } from 'react';

const NFTCard = ({ nft, userAddress, userBalance, onBuy, onViewDetails }) => {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const getFallbackImage = () => {
        return `https://via.placeholder.com/300/0088cc/ffffff?text=${encodeURIComponent(nft.name)}`;
    };

    const canBuy = userAddress && nft.isOnSale && userBalance && parseFloat(userBalance) >= parseFloat(nft.price);

    return (
        <div 
            className={`nft-card ${isHovered ? 'hovered' : ''} ${!nft.isOnSale ? 'not-for-sale' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="nft-image-container">
                <img 
                    src={imageError ? getFallbackImage() : nft.image} 
                    alt={nft.name}
                    className="nft-image"
                    onError={handleImageError}
                    loading="lazy"
                />
                <div className="nft-overlay">
                    <button 
                        className="view-details-btn"
                        onClick={() => onViewDetails(nft)}
                    >
                        👁️ View Details
                    </button>
                </div>
                {!nft.isOnSale && (
                    <div className="not-for-sale-badge">
                        Not for Sale
                    </div>
                )}
            </div>
            
            <div className="nft-content">
                <h3 className="nft-title">{nft.name}</h3>
                <p className="nft-description">{nft.description}</p>
                
                <div className="nft-meta">
                    <span className="nft-collection">
                        <span className="collection-badge">{nft.collection}</span>
                    </span>
                    
                    {nft.isOnSale ? (
                        <div className="nft-price-section">
                            <span className="price-label">Price</span>
                            <div className="price-amount">
                                <span className="ton-icon">💎</span>
                                <span className="price">{nft.price} TON</span>
                            </div>
                        </div>
                    ) : (
                        <div className="nft-status">
                            <span className="status-label">Status</span>
                            <div className="status-badge not-available">Not for Sale</div>
                        </div>
                    )}
                </div>
                
                {nft.attributes && nft.attributes.length > 0 && (
                    <div className="nft-attributes-preview">
                        <div className="attributes-count">
                            {nft.attributes.length} attribute{nft.attributes.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}
                
                <button 
                    className={`buy-button ${!canBuy ? 'disabled' : ''}`}
                    onClick={() => onBuy(nft)}
                    disabled={!canBuy}
                >
                    {!userAddress 
                        ? 'Connect Wallet' 
                        : !nft.isOnSale
                        ? 'Not for Sale'
                        : canBuy
                        ? 'Buy Now'
                        : 'Insufficient Balance'
                    }
                </button>
            </div>
        </div>
    );
};

export default NFTCard;