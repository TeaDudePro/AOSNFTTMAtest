// frontend/src/app.js
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import TONConnect from './components/TONConnect';
import NFTList from './components/NFTList';
import LoadingSpinner from './components/LoadingSpinner';
import useMobileDetection from './hooks/useMobileDetection';
import apiService from './services/api';
import './styles/main.css';

function App() {
    const [userAddress, setUserAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [nfts, setNfts] = useState([]);
    const [collectionInfo, setCollectionInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        limit: 20,
        offset: 0,
        total: 0
    });
    
    const { isMobile, isTelegram } = useMobileDetection();

    useEffect(() => {
        // Инициализация Telegram Web App
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.expand();
            tg.ready();
            
            if (tg.colorScheme === 'dark') {
                tg.setHeaderColor('#1c1c1c');
                tg.setBackgroundColor('#1c1c1c');
            } else {
                tg.setHeaderColor('#ffffff');
                tg.setBackgroundColor('#ffffff');
            }
        }

        loadNFTs();
        loadCollectionInfo();
    }, []);

    const loadNFTs = async (limit = 20, offset = 0) => {
        try {
            setLoading(true);
            setError(null);
            
            const data = await apiService.fetchNFTs(limit, offset);
            setNfts(data.nfts);
            setPagination(data.pagination);
            
        } catch (err) {
            console.error('Failed to load NFTs:', err);
            setError('Failed to load NFTs. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const loadCollectionInfo = async () => {
        try {
            const info = await apiService.fetchCollectionInfo();
            setCollectionInfo(info);
        } catch (err) {
            console.error('Failed to load collection info:', err);
        }
    };

    const handleConnect = (address) => {
        setUserAddress(address);
        setError(null);
    };

    const handleBalanceUpdate = (newBalance) => {
        setBalance(newBalance);
    };

    const handleError = (errorMessage) => {
        setError(errorMessage);
    };

    const handleRetry = () => {
        setError(null);
        if (userAddress) {
            setBalance(null);
        } else {
            loadNFTs();
        }
    };

    const loadMoreNFTs = () => {
        const newOffset = pagination.offset + pagination.limit;
        if (newOffset < pagination.total) {
            loadNFTs(pagination.limit, newOffset);
        }
    };

    return (
        <TonConnectUIProvider 
            manifestUrl={window.location.origin + "/tonconnect-manifest.json"}
            actionsConfiguration={{
                twaReturnUrl: isTelegram ? 'https://t.me/YourBotUsername' : window.location.href
            }}
            uiPreferences={{ theme: isTelegram ? 'DARK' : 'SYSTEM' }}
        >
            <div className={`app ${isMobile ? 'mobile' : ''} ${isTelegram ? 'telegram' : ''}`}>
                <header className="app-header">
                    <h1>AOS NFT STORE</h1>
                    
                    {collectionInfo && (
                        <div className="collection-info">
                            <h2>{collectionInfo.name}</h2>
                            {collectionInfo.description && (
                                <p className="collection-description">{collectionInfo.description}</p>
                            )}
                            {collectionInfo.itemsCount && (
                                <div className="collection-stats">
                                    <span className="stat">{collectionInfo.itemsCount} items</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="environment-badge">
                        {isTelegram ? '📱 Telegram' : '🌐 Web'} 
                        {isMobile && ' • Mobile'}
                    </div>
                    
                    <TONConnect 
                        onConnect={handleConnect}
                        onBalanceUpdate={handleBalanceUpdate}
                        onError={handleError}
                    />
                    
                    {balance !== null && userAddress && (
                        <div className={`balance-info ${balance === "0" ? 'zero-balance' : ''}`}>
                            <div className="balance-display">
                                <span className="balance-icon">💎</span>
                                <span className="balance-amount">{balance} TON</span>
                            </div>
                            {balance === "0" && (
                                <div className="zero-balance-warning">
                                    Your wallet balance is zero. You need TON to purchase NFTs.
                                </div>
                            )}
                        </div>
                    )}
                </header>
                
                <main>
                    {error ? (
                        <div className="error-state">
                            <div className="error-icon">⚠️</div>
                            <h3>Something went wrong</h3>
                            <p>{error}</p>
                            <button className="retry-button" onClick={handleRetry}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <NFTList 
                            nfts={nfts} 
                            userAddress={userAddress}
                            userBalance={balance}
                            loading={loading}
                            pagination={pagination}
                            onLoadMore={loadMoreNFTs}
                        />
                    )}
                </main>
                
                <footer className="app-footer">
                    <p>Powered by TON Blockchain • NFT data from Getgems</p>
                    {userAddress && (
                        <p className="wallet-status">
                            🔗 Wallet Connected • Real-time balance
                        </p>
                    )}
                </footer>
            </div>
        </TonConnectUIProvider>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);