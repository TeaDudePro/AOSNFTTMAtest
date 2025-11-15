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
        limit: 12,
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

        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Загружаем NFT и информацию о коллекции параллельно
            const [nftsData, collectionData] = await Promise.all([
                apiService.fetchNFTs(12, 0),
                apiService.fetchCollectionInfo().catch(err => {
                    console.warn('Failed to load collection info:', err);
                    return null;
                })
            ]);
            
            setNfts(nftsData.nfts);
            setPagination(nftsData.pagination);
            setCollectionInfo(collectionData || nftsData.collection);
            
        } catch (err) {
            console.error('Failed to load initial data:', err);
            // Не показываем ошибку пользователю, используем fallback данные
            const fallbackData = apiService.getFallbackNFTs(12);
            setNfts(fallbackData.nfts);
            setPagination(fallbackData.pagination);
            setCollectionInfo(fallbackData.collection);
        } finally {
            setLoading(false);
        }
    };

    const loadNFTs = async (limit = 12, offset = 0) => {
        try {
            setLoading(true);
            const data = await apiService.fetchNFTs(limit, offset);
            setNfts(data.nfts);
            setPagination(data.pagination);
            
        } catch (err) {
            console.error('Failed to load NFTs:', err);
            // Используем существующие данные или fallback
            if (nfts.length === 0) {
                const fallbackData = apiService.getFallbackNFTs(limit);
                setNfts(fallbackData.nfts);
                setPagination(fallbackData.pagination);
            }
        } finally {
            setLoading(false);
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
        loadInitialData();
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
                    <h1>🎭 TON NFT Marketplace</h1>
                    
                    {collectionInfo && (
                        <div className="collection-info">
                            <h2>{collectionInfo.name}</h2>
                            {collectionInfo.description && (
                                <p className="collection-description">{collectionInfo.description}</p>
                            )}
                            <div className="collection-stats">
                                <span className="stat">📦 {pagination.total} items</span>
                                <span className="stat">🏢 Getgems</span>
                            </div>
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