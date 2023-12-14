import { ChatP2pRelay } from "./pubsub/ChatP2pRelay.js";

import 'deyml/config';

/**
 *	@type {ChatP2pRelay}
 */
const p2pRelay = new ChatP2pRelay();

/**
 *	@returns {Promise<unknown>}
 */
export function startP2pRelay()
{
	return new Promise( async ( resolve, reject ) =>
	{
		try
		{
			await p2pRelay.start();
			console.log( `))) Metabeem Chat P2P Relay listening on port ${ p2pRelay.relayOptions.port }` );
			resolve( p2pRelay );
		}
		catch ( err )
		{
			reject( err );
		}
	});
}
