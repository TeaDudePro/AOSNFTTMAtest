import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import apiService from '../services/api';

const TONConnect = ({ onConnect, onBalanceUpdate, onError }) => {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Функция для получения баланса
    const fetchWalletBalance = async (address) => {
        if (!address) return;
        
        setIsLoading(true);
        try {
            console.log('Fetching balance for address:', address);
            const balanceData = await apiService.fetchBalance(address);
            
            console.log('Balance data received:', balanceData);
            
            // Обновляем баланс в родительском компоненте
            onBalanceUpdate(balanceData.balance);
            
            // Обновляем время последнего обновления
            setLastUpdate(new Date().toLocaleTimeString());
            
            // Если есть callback для успешного подключения
            if (onConnect) {
                onConnect(address);
            }
            
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            
            // Показываем ошибку пользователю
            if (onError) {
                onError(`Failed to load balance: ${error.message}`);
            }
            
            // Устанавливаем баланс 0 в случае ошибки
            onBalanceUpdate("0");
        } finally {
            setIsLoading(false);
        }
    };

    // Эффект при изменении кошелька
    useEffect(() => {
        if (wallet?.account?.address) {
            console.log('Wallet connected, address:', wallet.account.address);
            fetchWalletBalance(wallet.account.address);
        } else {
            // Сбрасываем баланс при отключении кошелька
            onBalanceUpdate("0");
            setLastUpdate(null);
        }
    }, [wallet?.account?.address]);

    // Функция для принудительного обновления баланса
    const refreshBalance = () => {
        if (wallet?.account?.address) {
            fetchWalletBalance(wallet.account.address);
        }
    };

    return (
        <div className="ton-connect-wrapper">
            <div className="ton-connect-header">
                <h3>Connect Your TON Wallet</h3>
                <p>Connect your wallet to view balance and trade NFTs</p>
            </div>
            
            <TonConnectButton 
                className="ton-connect-button"
            />
            
            {wallet && (
                <div className="wallet-details">
                    <div className="wallet-info">
                        <div className="wallet-address">
                            <strong>Connected:</strong>
                            <span className="address">
                                {wallet.account.address.slice(0, 8)}...{wallet.account.address.slice(-8)}
                            </span>
                        </div>
                        <div className="wallet-chain">
                            <strong>Network:</strong>
                            <span className="chain">{wallet.account.chain}</span>
                        </div>
                    </div>
                    
                    <div className="balance-section">
                        <div className="balance-header">
                            <span>Wallet Balance</span>
                            <button 
                                onClick={refreshBalance}
                                disabled={isLoading}
                                className="refresh-button"
                                title="Refresh balance"
                            >
                                {isLoading ? '⟳' : '↻'}
                            </button>
                        </div>
                        
                        {isLoading ? (
                            <div className="balance-loading">
                                <div className="loading-spinner"></div>
                                <span>Updating balance...</span>
                            </div>
                        ) : (
                            <div className="balance-amount">
                                <span className="ton-amount">💎 ... TON</span>
                                {lastUpdate && (
                                    <div className="last-update">
                                        Updated: {lastUpdate}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TONConnect;