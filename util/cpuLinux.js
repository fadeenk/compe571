const { spawn } = require('child_process');

function cpuLoad() {
    return new Promise((resolve) => {
        const child = spawn('top', ['-b', '-n 1'], {stdio: 'pipe'});
        let data = '';
        child.stdout.on('data', (buff) => {
            data += buff.toString('utf8');
        });
        child.on('close', () => {
            // get the string buffer and remove header then split each line into an array
            const row = data.substring(5).split('\n')[2];
            // ensure output is received correctly (initial top output doesn't stream properly)
            if (!row || !row.startsWith('%Cpu(s):')) return resolve('');
            // split the row into the different cpu status and pick the idle out then convert it to a number
            const percentage = parseFloat(row.split(',')[3].split(' ')[1]);
            // calculate the utilization percentage
            resolve(100 - percentage);
        })
    })
}

module.exports = {
    measure: cpuLoad
}
