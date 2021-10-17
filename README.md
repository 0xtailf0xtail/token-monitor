# Token Monitor: Monitoring the transfer of ERC-721 token

## Usage
- Setup  

```
yarn install
```

- Build  

```
yarn build
```

- Run  
Prepare the project key of [Infura](https://infura.io) and set to the environment variable `INFURA_KEY`  

```
yarn start
```

or

```
INFURA_KEY=<project key> yarn start
```

- Run as a container

```
docker build . -t token-monitor:latest
docker run --rm -it -e INFURA_KEY=<project key> token-monitor
```