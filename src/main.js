import { startP2pRelay } from "./relay/relay.js";

import 'deyml/config';
import { startChatServer } from "./socket/ChatServer.js";


async function asyncMain()
{
	const p2pRelay = await startP2pRelay();
	await startChatServer( p2pRelay );
}

asyncMain().then( res =>{} ).catch( err => { console.error( err ) } );
