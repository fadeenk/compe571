const os = require('os')
const { spawn } = require('child_process');
const {EventEmitter} = require('events');
// create event emitter to use to simplify programming logic
const eventEmitter = new EventEmitter();
const NS_PER_SEC = 1e9;
// Define variables used
const result = {};
const counters = {};
// create measurement variables
const benchTime = process.hrtime();
const cpuLoad = [];
let completedProcesses = 0;

// use appropriate cpu method to get cpu usage
let cpu;
if (os.platform().match(/^win/)) {
    cpu = require('./cpuWin');
} else {
    cpu = require('./cpuLinux');
}

/**
 * Benchmark Configuration
 * process {string[]} names of the tasks to benchmark inside the tasks directory
 * process.env.fileToRead {string} the path for the file used for the readFile tasks relative to project directory
 * underHeavyLoad {Boolean} controls if the benchmark tool should generate additional cpu load or not
 * HEAVY_LOAD_THRESHOLD {Number(0-90)} the minimum threshold that the benchmark will target when underHeavyLoad is enabled
 * SAMPLE_SIZE {Number} The number of times to execute each task
 */
const processes = ['busyWait', 'lazyWait', 'readFile', 'readFileSync'];
process.env.fileToRead = 'sampleFile';
const underHeavyLoad = true;
const HEAVY_LOAD_THRESHOLD = 70;
const SAMPLE_SIZE = 50;

// Print message to the user explaining what is being executed
console.log(`Benchmarking ${processes.join(', ')} in parallel with sample size of ${SAMPLE_SIZE} and${underHeavyLoad === false ? ' NOT': ''} under heavy load${underHeavyLoad === true ? ` with cpu minimum threshold of ${HEAVY_LOAD_THRESHOLD}`: ''}.`);

// Set an interval to measure the cpu load every second
let sampleCPUInterval = setInterval(() => {
    cpu.measure().then((percentage) => {
        // ensure we got a valid read
        if (!isNaN(percentage)) {
            // track cpu load (used for providing user with information regarding benchmarking cpu utilization/ proof heavyLoad mode works properly)
            cpuLoad.push(percentage);
            // check to see if need to add more load if under heavy load mode
            if (underHeavyLoad && percentage < HEAVY_LOAD_THRESHOLD) generateLoad();
        }
    })
}, 1000);

// add event listeners
// measurement taken for any process
eventEmitter.on('measurementTaken', (proc) => {
    // initialize counter for process being measured if not already initialized
    if (!counters[proc]) counters[proc] = 1;
    // if sample size is not reached keep measuring
    if (counters[proc] < SAMPLE_SIZE) {
        counters[proc]++;
        measure(proc)
    } else {
        // if measurements completed emit completed event
        eventEmitter.emit('completed', proc);
    }
});

// measuring a process has completed
eventEmitter.on('completed', (proc) => {
    completedProcesses++;
    // process results to extract the information about execution time
    const executionTimes = result[proc].map((record) => record.execTime);
    const avg = executionTimes.reduce(((number, acc) => number + acc), 0)/executionTimes.length;
    // log execution time information
    console.log(`${proc} => Min: ${Math.min(...executionTimes).toFixed(2)}ms, Max: ${Math.max(...executionTimes).toFixed(2)}ms, Avg: ${avg.toFixed(2)}ms`);
    // if all processes completed
    if (completedProcesses === processes.length) {
        // stop measuring the cpu
        clearInterval(sampleCPUInterval);
        // measure benchmarking execution time
        const diff = process.hrtime(benchTime);
        // output results to the user
        console.log(`Benchmarking execution time: ${((diff[0] * NS_PER_SEC + diff[1])/1e9).toFixed(2)} sec`)
        console.log(`CPU => Min: ${Math.min(...cpuLoad)}%, Max: ${Math.max(...cpuLoad)}%, Avg: ${(cpuLoad.reduce(((number, acc) => number + acc), 0)/cpuLoad.length).toFixed(2)}%`)
    }
});

// if in heavyLoad mode generate initial load the start
if (underHeavyLoad) {
    generateLoad();
}

// TODO measure processes serially
// start measuring each process in the processes array
processes.forEach((process) => measure(process));

// creates 3 processes to increase cpu load
function generateLoad() {
    for (let i=0; i < 3; i++) spawn('node', ['busyWait']);
}

// main logic for measuring each process
function measure(proc) {
    // https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_hrtime_time
    // Using the recommended way to measure performance (execution time)
    // capture arbitrary before right before the process starts
    const time = process.hrtime();
    // spawn the process (thread)
    const measurable  = spawn('node', ['./tasks/' + proc]);
    // when process exits
    measurable.on('close', (code) => {
        // measure the time diff
        const diff = process.hrtime(time);
        // append data to results object
        if (!result[proc]) result[proc] = [];
        result[proc].push({
            // pid is used for debugging to ensure actual processes were created
            pid: measurable.pid,
            execTime: (diff[0] * NS_PER_SEC + diff[1])/1e6,
        });
        // emit event for measurement completion
        eventEmitter.emit('measurementTaken', proc)
    });
}
