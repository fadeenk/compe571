const { spawn } = require('child_process');

function cpuLoad() {
    return new Promise((resolve) => {
        const child = spawn('top', ['-b', '-n 1'], {stdio: 'pipe'});
        child.stdout.on('data', (data) => {
            // get the string buffer and remove header then split each lint into an array
            const row = data.toString('utf8').substring(5).split('\n')[2];
            // ensure output is received correctly (initial top output doesn't stream properly)
            if (!row.startsWith('%Cpu(s):')) return resolve('');
            // TODO find a better way to get accurate cpu util
            console.log(row)
            // split the row into the different cpu status and pick the idle out then convert it to a number
            const percentage = parseFloat(row.split(',')[3].split(' ')[1]);
            // calculate the utilization percentage
            resolve(100 - percentage);
        });
    })
}

module.exports = {
    measure: cpuLoad
}
