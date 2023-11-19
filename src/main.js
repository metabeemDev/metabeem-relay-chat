import minimist from "minimist";
//import { RelayNode } from "denetwork-relay";
const argv = minimist( process.argv.slice( 2 ) );
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { bootstrappers } from './bootstrappers.js';
import { startServer } from "./ChatServer.js";
import { startRelay } from "./Relay.js";

import 'dotenv/config.js'


async function runServer()
{
	await startServer();
}
async function runRelay()
{
	await startRelay();
}

runServer().then();
runRelay().then();
