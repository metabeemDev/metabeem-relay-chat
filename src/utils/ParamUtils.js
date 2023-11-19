import _ from "lodash";
import minimist from "minimist";
// import { ChatServerRedisOptions } from "denetwork-chat-server";
import denetwork_chat_server from 'denetwork-chat-server';
const { ChatServerRedisOptions } = denetwork_chat_server;


const argv = minimist( process.argv.slice( 2 ) );

/**
 * 	@class
 */
export class ParamUtils
{
	static getStringParam( name, defaultValue )
	{
		if ( ! _.isString( name ) || _.isEmpty( name ) )
		{
			return defaultValue;
		}

		if ( undefined !== argv &&
		     undefined !== argv[ name ] )
		{
			return argv[ name ];
		}
		if ( undefined !== process &&
		     undefined !== process.env &&
		     undefined !== process.env[ name.toUpperCase() ] )
		{
			return process.env[ name.toUpperCase() ];
		}

		return defaultValue;
	}

	static getIntParam( name, defaultValue )
	{
		const value = this.getStringParam( name );
		if ( _.isString( value ) && ! _.isEmpty( value ) )
		{
			return parseInt( value );
		}

		return defaultValue;
	}

	/**
	 *	@return {number}
	 */
	static getChatPort()
	{
		const port = this.getIntParam( `chat_port`, this.getDefaultChatPort() );
		if ( this.isValidPortNumber( port ) )
		{
			return port;
		}

		return this.getDefaultChatPort();
	}

	static getDefaultChatPort()
	{
		return 6616;
	}

	static isValidPortNumber( port )
	{
		return _.isInteger( port ) && port > 80 && port <= 65535;
	}


	/**
	 * 	@returns {ChatServerRedisOptions}
	 */
	static getRedisOptions()
	{
		return {
			port : this.getIntParam( 'REDIS_PORT', 6379 ),
			host : this.getStringParam( 'REDIS_HOST', 'host.docker.internal' ),
			username : this.getStringParam( 'REDIS_USERNAME', '' ),
			password : this.getStringParam( 'REDIS_PASSWORD', '' ),
			db : this.getIntParam( 'REDIS_DB', 0 ),
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
