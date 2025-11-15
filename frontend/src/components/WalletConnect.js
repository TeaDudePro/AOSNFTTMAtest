import React, { useState } from 'react';

const WalletConnect = ({ onConnect, onBalanceUpdate }) => {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            // Имитация подключения кошелька
            setTimeout(() => {
                const mockAddress = "EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N";
                onConnect(mockAddress);
                onBalanceUpdate("2.5");
                setIsConnecting(false);
            }, 2000);
        } catch (error) {
            console.error('Connection failed:', error);
            setIsConnecting(false);
        }
    };

    return (
        <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="connect-button"
        >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
    );
};

export default WalletConnect;