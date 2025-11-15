import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <div className="loading-container">
            <div className="spinner">
                <div className="spinner-circle"></div>
            </div>
            <p className="loading-message">{message}</p>
        </div>
    );
};

export default LoadingSpinner;