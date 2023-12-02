import _ from "lodash";
import minimist from "minimist";
import denetwork_chat_server from 'denetwork-chat-server';
import { ProcessUtil } from "denetwork-utils";
const { RedisOptions } = denetwork_chat_server;


const argv = minimist( process.argv.slice( 2 ) );

/**
 * 	@class
 */
export class ParamUtils
{
	/**
	 *	@return {number}
	 */
	static getChatPort()
	{
		const port = ProcessUtil.getParamIntValue( `chat_port`, this.getDefaultChatPort() );
		if ( ProcessUtil.isValidPortNumber( port ) )
		{
			return port;
		}

		return this.getDefaultChatPort();
	}

	static getDefaultChatPort()
	{
		return 6616;
	}

	/**
	 * 	@returns {RedisOptions}
	 */
	static getRedisOptions()
	{
		return {
			port : ProcessUtil.getParamIntValue( 'REDIS_PORT', 6379 ),
			host : ProcessUtil.getParamStringValue( 'REDIS_HOST', 'host.docker.internal' ),
			username : ProcessUtil.getParamStringValue( 'REDIS_USERNAME', null ),
			password : ProcessUtil.getParamStringValue( 'REDIS_PASSWORD', null ),
			db : ProcessUtil.getParamIntValue( 'REDIS_DB', 0 ),
		};
	}

	static getPeers()
	{
		//	http://localhost:1212,http://localhost:1213,http://localhost:1214
		const peerArg = argv.peers || process.env.PEERS;
		if ( ! _.isString( peerArg ) || _.isEmpty( peerArg ) )
		{
			return [];
		}

		//	...
		let peers = [];
		const peerList = peerArg.split( ',' );
		for ( let peer of peerList )
		{
			if ( peer.endsWith( '/' ) )
			{
				peer = peer.slice( 0, -1 );
			}
			peer = peer.trim();
			if ( _.isEmpty( peer ) )
			{
				continue;
			}

			//	...
			peers.push( `${ peer }/gun` );
		}

		return peers;
	}
}
