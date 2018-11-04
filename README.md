# Known issues
- using top to get cpu usage is inaccurate within docker
- all tasks being measured at the same time (not really measure tasks correctly when not in no load mode)
- generateLoad function not generating sufficient load on powerful machines

# TODO
- [✔] serial process benchmarking
- [✔] support accurate linux measurement
  - If ran in a docker container the CPU percentage is relative to the root process. Docker containers run as child process (which is why we get wrong reading). [Source](https://medium.com/techlogs/docker-how-to-check-your-containers-cpu-usage-8121515a3b8).
- [✔] Add memory measurement support
  - [✔] windows
  - [✔] linux
- [✖] Add description and clean up further

# Requirements
### Note: You can use either or depending on what you have available/ more convenient for you
- [NodeJS](https://nodejs.org/en/)
- [Docker](https://www.docker.com/get-started)

# How to execute
* using node: 
  * `node tasks/generateTestFile`
  * `node benchmark`
* using docker:
  * `docker-compose up`
