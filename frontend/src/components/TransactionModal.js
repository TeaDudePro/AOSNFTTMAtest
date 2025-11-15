import React from 'react';

const TransactionModal = ({ isOpen, onClose, transaction }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Transaction Details</h2>
                {transaction && (
                    <div>
                        <p>NFT: {transaction.nftName}</p>
                        <p>Price: {transaction.price} TON</p>
                        <p>Status: {transaction.status}</p>
                    </div>
                )}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default TransactionModal;