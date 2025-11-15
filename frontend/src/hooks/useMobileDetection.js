import { useState, useEffect } from 'react';

const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTelegram, setIsTelegram] = useState(false);

    useEffect(() => {
        // Определение мобильного устройства
        const checkMobile = () => {
            const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(mobileCheck);
        };

        // Проверка на запуск в Telegram
        const checkTelegram = () => {
            setIsTelegram(!!window.Telegram?.WebApp);
        };

        checkMobile();
        checkTelegram();

        // Обработчик изменения размера окна
        const handleResize = () => {
            checkMobile();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isMobile, isTelegram };
};

export default useMobileDetection;