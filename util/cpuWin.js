const { spawn } = require('child_process');

function cpuLoad() {
    return new Promise((resolve) => {
        const child = spawn('wmic', ['cpu', 'get', 'loadpercentage'], {stdio: 'pipe'});
        let data = '';
        child.stdout.on('data', (buff) => {
            data += buff.toString('utf8');
        });
        child.on('close', () => {
            resolve(parseInt(data.substring(16).trim()));
        })

    })
}

module.exports = {
    measure: cpuLoad
}
