import { BaseP2pRelay } from "./BaseP2pRelay.js";
import _ from "lodash";

import "deyml/config";


/**
 * 	@class
 */
export class ChatP2pRelay extends BaseP2pRelay
{
	constructor()
	{
		super( `sync-socket-chat` );
	}

	async start()
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				//
				//	start p2p relay
				//
				await super.start( async ( p2pPackage ) =>
				{
					if ( _.isObject( p2pPackage.body ) &&
					     _.has( p2pPackage.body, 'heartbeat' ) )
					{
						//	ignore heartbeat
						console.log( `|||||| heartbeat ~~~~~~~~` );
						return false;
					}

					//
					//	received a broadcast
					//
					console.log( `|||||| received a p2p broadcast, push to messageRequestPool :`, p2pPackage );
					await this.messageRequestPool.push( p2pPackage );
				});

				console.log( `|||||||| p2p relay started for syncing topic : ${ this.subTopic }` );

				//	...
				resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}
}
