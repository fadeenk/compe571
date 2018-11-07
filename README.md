# Known issues
- using top to get cpu usage is inaccurate within docker
  - When running in a docker container the CPU percentage is relative to the root process. 
  - Docker containers run as child process (which is why we get wrong reading). [Source](https://medium.com/techlogs/docker-how-to-check-your-containers-cpu-usage-8121515a3b8).
- generateLoad function not working properly in docker due to the wrong reading

# TODO
- [✔] serial process benchmarking
- [✔] support accurate linux measurement
  - If ran in a docker container the CPU percentage is relative to the root process. Docker containers run as child process (which is why we get wrong reading). [Source](https://medium.com/techlogs/docker-how-to-check-your-containers-cpu-usage-8121515a3b8).
- [✔] Add memory measurement support
  - [✔] windows
  - [✔] linux
- [✔] Add description and clean up further

# Requirements
### Note: You can use either or depending on what you have available/ more convenient for you
- [NodeJS](https://nodejs.org/en/)
- [Docker](https://www.docker.com/get-started)

# How to execute
* using node: 
  * `node util/generateTestFile` (only needed if benchmarking readFile)
  * `node benchmark`
* using docker:
  * `docker-compose up`

# Configuration
All configurations are part of the source code in the `benchmark.js` file. 

The following configuration are available

Field | Type | Description
------------|----------|----
processes | string[] | the tasks names in the `tasks` folder to benchmark
fileToRead | string | the file to use for the `readFile` and the `readFileSync` tasks
parallel | boolean | controls tasks benchmarking. If true, will benchmark all tasks in parallel.
underHeavyLoad | boolean | controls creation of additional tasks to create artificial cpu load.
HEAVY_LOAD_THRESHOLD | Number | the minimum cpu load threshold
SAMPLE_SIZE | Number | The sample size to use for benchmarking each task
