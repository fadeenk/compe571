const { spawn } = require('child_process');

function cpuLoad() {
    return new Promise((resolve) => {
        // use wmic command tool to get cpu load
        const child = spawn('wmic', ['cpu', 'get', 'loadpercentage'], {stdio: 'pipe'});
        let data = '';
        // read the data from the stdout stream
        child.stdout.on('data', (buff) => {
            data += buff.toString('utf8');
        });
        // when process completed execution parse the output into an integer and return it
        child.on('close', () => {
            return resolve(parseInt(data.substring(16).trim()));
        })

    })
}

module.exports = {
    measure: cpuLoad
}
