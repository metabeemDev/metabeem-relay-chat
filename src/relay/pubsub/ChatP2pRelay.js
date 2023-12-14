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
					     _.has( p2pPackage.body, 'bizPing' ) )
					{
						//	ignore heartbeat
						console.log( `|||||| p2p : received a business broadcasting bizPing packet ~~~~~~~~` );
						return false;
					}

					//
					//	received a broadcast
					//
					console.log( `|||||| p2p : received a business broadcasting package, try to push it into messageRequestPool` );
					await this.p2pChatPackagePool.push( p2pPackage );
				});

				console.log( `|||||||| p2p : relay started for syncing topic : ${ this.subTopic }` );

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
