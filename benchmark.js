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
const executingProcesses = [];
let cpuLoad = [];
let memoryUsage = [];
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
const processes = ['readFile', 'readFileSync'];
process.env.fileToRead = 'sampleFile';
const parallel = false;
const underHeavyLoad = false;
const HEAVY_LOAD_THRESHOLD = 70;
const SAMPLE_SIZE = 50;

// Print message to the user explaining what is being executed
console.log(`Benchmarking ${processes.join(', ')} in parallel with sample size of ${SAMPLE_SIZE} and${underHeavyLoad === false ? ' NOT': ''} under heavy load${underHeavyLoad === true ? ` with cpu minimum threshold of ${HEAVY_LOAD_THRESHOLD}`: ''}.`);

// Set an interval to measure every second
let sampleCPUInterval = setInterval(() => {
    // measure the cpu load
    cpu.measure().then((percentage) => {
        executingProcesses.forEach(process => {
            if (!Array.isArray(cpuLoad[process])) cpuLoad[process] = [];
            if (!Array.isArray(memoryUsage[process])) memoryUsage[process] = [];
            // track cpu load (used for providing user with information regarding benchmarking cpu utilization/ proof heavyLoad mode works properly)
            cpuLoad[process].push(percentage);
            // track memory usage for each process
            memoryUsage[process].push(global.process.memoryUsage());
        });
        // check to see if need to add more load if under heavy load mode
        if (underHeavyLoad && percentage < HEAVY_LOAD_THRESHOLD) generateLoad();
    })
}, 1000);

// add event listeners
// measurement taken for any process
eventEmitter.on('measurementTaken', (proc, id) => {
    // initialize counter for process being measured if not already initialized
    if (!counters[proc]) counters[proc] = 1;
    // if sample size is not reached keep measuring
    if (counters[proc] < SAMPLE_SIZE) {
        counters[proc]++;
        measure(proc, id)
    } else {
        // if measurements completed emit completed event
        eventEmitter.emit('completed', proc, id);
    }
});

// measuring a process has completed
eventEmitter.on('completed', (proc, id) => {
    completedProcesses++;
    // process results to extract the information about execution time
    const executionTimes = result[proc].map((record) => record.execTime);
    const avg = executionTimes.reduce(((number, acc) => number + acc), 0)/executionTimes.length;
    // log execution time information
    console.log(`${proc}`);
    console.log(`TIME => Min: ${Math.min(...executionTimes).toFixed(2)}ms, Max: ${Math.max(...executionTimes).toFixed(2)}ms, Avg: ${avg.toFixed(2)}ms`);
    console.log(`CPU => Min: ${Math.min(...cpuLoad[id]).toFixed(2)}%, Max: ${Math.max(...cpuLoad[id]).toFixed(2)}%, Avg: ${(cpuLoad[id].reduce(((number, acc) => number + acc), 0)/cpuLoad[id].length).toFixed(2)}%`)
    const rss = memoryUsage[id].map(record => record.rss /1024/1024);
    console.log(`RSS => Min: ${Math.min(...rss).toFixed(2)} MB, Max: ${Math.max(...rss).toFixed(2)} MB, Avg: ${(rss.reduce(((number, acc) => number + acc), 0)/rss.length).toFixed(2)} MB`)
    const heapTotal = memoryUsage[id].map(record => record.heapTotal /1024/1024);
    console.log(`HEAP Total => Min: ${Math.min(...heapTotal).toFixed(2)} MB, Max: ${Math.max(...heapTotal).toFixed(2)} MB, Avg: ${(heapTotal.reduce(((number, acc) => number + acc), 0)/heapTotal.length).toFixed(2)} MB`)
    const heapUsed = memoryUsage[id].map(record => record.heapUsed /1024/1024);
    console.log(`HEAP Used => Min: ${Math.min(...heapUsed).toFixed(2)} MB, Max: ${Math.max(...heapUsed).toFixed(2)} MB, Avg: ${(heapUsed.reduce(((number, acc) => number + acc), 0)/heapUsed.length).toFixed(2)} MB`)
    const external = memoryUsage[id].map(record => record.external /1024);
    console.log(`External Memory => Min: ${Math.min(...external).toFixed(2)} KB, Max: ${Math.max(...external).toFixed(2)} KB, Avg: ${(external.reduce(((number, acc) => number + acc), 0)/external.length).toFixed(2)} KB`)
    console.log(`======================================`)
    // if all processes completed
    if (completedProcesses === processes.length) {
        // stop measuring the cpu
        clearInterval(sampleCPUInterval);
        // measure benchmarking execution time
        const diff = process.hrtime(benchTime);
        // combine all the cpu metrics from all processes into one array so we can calculate the metrics for the benchmark process
        cpuLoad = [].concat(...cpuLoad);
        memoryUsage = [].concat(...memoryUsage);
        // output results to the user
        console.log(`Benchmarking process`);
        console.log(`Benchmarking execution time: ${((diff[0] * NS_PER_SEC + diff[1])/1e9).toFixed(2)} sec`)
        console.log(`CPU => Min: ${Math.min(...cpuLoad).toFixed(2)}%, Max: ${Math.max(...cpuLoad).toFixed(2)}%, Avg: ${(cpuLoad.reduce(((number, acc) => number + acc), 0)/cpuLoad.length).toFixed(2)}%`)
        const rss = memoryUsage.map(record => record.rss /1024/1024);
        console.log(`RSS => Min: ${Math.min(...rss).toFixed(2)} MB, Max: ${Math.max(...rss).toFixed(2)} MB, Avg: ${(rss.reduce(((number, acc) => number + acc), 0)/rss.length).toFixed(2)} MB`)
        const heapTotal = memoryUsage.map(record => record.heapTotal /1024/1024);
        console.log(`HEAP Total => Min: ${Math.min(...heapTotal).toFixed(2)} MB, Max: ${Math.max(...heapTotal).toFixed(2)} MB, Avg: ${(heapTotal.reduce(((number, acc) => number + acc), 0)/heapTotal.length).toFixed(2)} MB`)
        const heapUsed = memoryUsage.map(record => record.heapUsed /1024/1024);
        console.log(`HEAP Used => Min: ${Math.min(...heapUsed).toFixed(2)} MB, Max: ${Math.max(...heapUsed).toFixed(2)} MB, Avg: ${(heapUsed.reduce(((number, acc) => number + acc), 0)/heapUsed.length).toFixed(2)} MB`)
        const external = memoryUsage.map(record => record.external /1024);
        console.log(`External Memory => Min: ${Math.min(...external).toFixed(2)} KB, Max: ${Math.max(...external).toFixed(2)} KB, Avg: ${(external.reduce(((number, acc) => number + acc), 0)/external.length).toFixed(2)} KB`)

    } else if (!parallel) {
        measure(processes[completedProcesses], completedProcesses)
    }
});

// if in heavyLoad mode generate initial load the start
if (underHeavyLoad) {
    generateLoad();
}

if (parallel) {
    // start measuring every process in the processes array
    processes.forEach((process, index) => measure(process, index));
} else {
    measure(processes[completedProcesses], completedProcesses)
}

// creates 3 processes to increase cpu load
function generateLoad() {
    for (let i=0; i < 3; i++) spawn('node', ['busyWait']);
}

// main logic for measuring each process
function measure(proc, id) {
    // https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_hrtime_time
    // Using the recommended way to measure performance (execution time)
    // capture arbitrary before right before the process starts
    const time = process.hrtime();
    executingProcesses.push(id);
    // spawn the process (thread)
    const measurable  = spawn('node', ['./tasks/' + proc]);
    // when process exits
    measurable.on('close', (code) => {
        // once the process has finished executing remove it from the executing processes so we dont collect cpu metrics for it any more
        executingProcesses.splice(executingProcesses.indexOf(id), 1);
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
        eventEmitter.emit('measurementTaken', proc, id)
    });
}
