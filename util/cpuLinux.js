const os = require('os');

function cpuLoad() {
    return new Promise((resolve) => {
        const stats1 = getCPUInfo();
        const startIdle = stats1.idle;
        const startTotal = stats1.total;

        setTimeout(function() {
            const stats2 = getCPUInfo();
            const endIdle = stats2.idle;
            const endTotal = stats2.total;

            const idle 	= endIdle - startIdle;
            const total 	= endTotal - startTotal;
            const perc	= idle / total * 100;
            console.log(perc)
            return resolve(perc)
        }, 1000 );
    })
}

function getCPUInfo(){
    const cpus = os.cpus();

    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;
    let total = 0;

    for(var cpu in cpus){
        if (!cpus.hasOwnProperty(cpu)) continue;
        user += cpus[cpu].times.user;
        nice += cpus[cpu].times.nice;
        sys += cpus[cpu].times.sys;
        irq += cpus[cpu].times.irq;
        idle += cpus[cpu].times.idle;
    }

    total = user + nice + sys + idle + irq;

    return {
        'idle': idle,
        'total': total
    };
}

// export the function to be able to call it from other files
module.exports = {
    measure: cpuLoad
}
