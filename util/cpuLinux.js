const { spawn } = require('child_process');

function cpuLoad() {
    return new Promise((resolve) => {
        // use top to get cpu data for the system
        const child = spawn('top', ['-b', '-n 1'], {stdio: 'pipe'});
        let data = '';
        // read the data from the stdout stream
        child.stdout.on('data', (buff) => {
            data += buff.toString('utf8');
        });
        // when process completed execution
        child.on('close', () => {
            // get the string buffer and remove header then split each line into an array
            const row = data.substring(5).split('\n')[2];
            // ensure output is received correctly (initial top output doesn't stream properly)
            if (!row || !row.startsWith('%Cpu(s):')) return resolve('');
            // split the row into the different cpu status and pick the idle out then convert it to a number
            const percentage = parseFloat(row.split(',')[3].split(' ')[1]);
            // calculate the utilization percentage
            return resolve(100 - percentage);
        })
    })
}

// export the function to be able to call it from other files
module.exports = {
    measure: cpuLoad
}
