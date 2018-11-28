const os = require('os');

function cpuLoad() {
    return new Promise((resolve) => {
        // get cpu base timings
        const base = getCPUInfo();
        // wait a second
        setTimeout(function() {
            // sample current
            const current = getCPUInfo();
            // calculate difference between the current and the base cpu timings
            const idle 	= current.idle - base.idle;
            const total = current.total - base.total;
            // calculate percentage
            const percentage = idle === 0 ? 100 : idle / total * 100;
            console.log(percentage)
            return resolve(percentage)
        }, 1000 );
    })
}

function getCPUInfo(){
    // get cpus information from the OS
    const cpus = os.cpus();

    // initialize variables to track the different cpu timings
    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;
    let total = 0;

    // go through all cpus and add up the timings
    for(var cpu in cpus){
        if (!cpus.hasOwnProperty(cpu)) continue;
        user += cpus[cpu].times.user;
        nice += cpus[cpu].times.nice;
        sys += cpus[cpu].times.sys;
        irq += cpus[cpu].times.irq;
        idle += cpus[cpu].times.idle;
    }

    // calculate the total cpu timings
    total = user + nice + sys + idle + irq;

    // return total and idle
    return {idle, total};
}

// export the function to be able to call it from other files
module.exports = {
    measure: cpuLoad
}
