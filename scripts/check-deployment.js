const https = require('https');

const services = {
    backend: 'https://ton-nft-backend.onrender.com/health',
    frontend: 'https://ton-nft-frontend.onrender.com'
};

async function checkService(name, url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            console.log(`✅ ${name}: ${res.statusCode} OK`);
            resolve(true);
        }).on('error', (err) => {
            console.log(`❌ ${name}: ${err.message}`);
            resolve(false);
        });
    });
}

async function checkAll() {
    console.log('🔍 Checking deployment...\n');
    
    const results = await Promise.all([
        checkService('Backend', services.backend),
        checkService('Frontend', services.frontend)
    ]);
    
    console.log('\n📊 Deployment Summary:');
    console.log(`Backend: ${results[0] ? '✅ Live' : '❌ Down'}`);
    console.log(`Frontend: ${results[1] ? '✅ Live' : '❌ Down'}`);
    
    if (results.every(r => r)) {
        console.log('\n🎉 All services are running successfully!');
    } else {
        console.log('\n⚠️ Some services are having issues.');
        process.exit(1);
    }
}

checkAll();