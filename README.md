# Great Burning Monitor
Monitoring the contract of Great Burning and report the result on Discord

## Usage
- Setup  

```
nvm install 16
yarn install
```

- Build  

```
yarn build
```

- Run  
Prepare the project key of [Infura](https://infura.io) and set to the environment variable `INFURA_KEY`.
Also, the token of the Discord bot needs to be set to the environment variable `DISCORD_TOKEN`.
Other settings can be changed through `config.ts`.
```
yarn start
```

or

```
INFURA_KEY=<project key> DISCORD_TOKEN=<token> yarn start
```

- Run as a container

```
docker build . -t token-monitor:latest
docker run --rm -it -e INFURA_KEY=<project key> -e DISCORD_TOKEN=<token> token-monitor
```