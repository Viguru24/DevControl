import fetch from 'node-fetch';

async function checkAutoMode() {
    try {
        const res = await fetch('http://localhost:3001/api/auto-mode');
        const data = await res.json();
        console.log(data.enabled ? 'ENABLED' : 'DISABLED');
    } catch (e) {
        console.log('DISABLED');
    }
}

checkAutoMode();
