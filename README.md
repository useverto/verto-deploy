# Verto deploy
CLI tool for deploying [Sapper](https://sapper.svelte.dev) exported applications on Arweave

## Installing
TODO

## First steps
- Before deploying, make sure that you run `sapper export --entry "your routes with spaces between them"` 
- Make sure you are deploying the `__sapper__/export` directory. It won't work with anything else.
- **Make sure that you are using RELATIVE urls with the built in sapper `goto` function and with anchor hrefs**

## Usage

```sh
verto help
```
Shows the help menu

### Deploy a folder
```sh
verto deploy --dir <Sapper project directory to deploy> --keyfile <path toArweave keyfile>
```
This deploys your Sapper project. What it does:
- Fixes links and hrefs (so it works with the arweave transaction id subfolder)
- Deploys all your files
- Creates a path manifest that links all files together **and** adds routes

### Get balance
```sh
verto balance --keyfile <path toArweave keyfile>
```
Helper command: returns your arweave balance

### Get transaction status
```sh
verto status <id>
```
Helper command: returns the status of the given transaction ID

## Why does this library exist?
The [arweave-deploy](https://github.com/ArweaveTeam/arweave-deploy) CLI does not work with Sapper applications. The routes are invalid and the links/hrefs also don't work. **verto-deploy** was built specifically for deploying Sapper apps.