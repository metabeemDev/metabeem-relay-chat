import { LocalParamUtils } from "../../utils/LocalParamUtils.js";
import { ChPubService, ChSubService } from "denetwork-queue";
import _ from "lodash";

/**
 * 	@class
 */
export class P2pPackagePool
{
	requestPoolName = `p2p-package-pool`;
	chPub;
	chSub;

	constructor()
	{
	}

	/**
	 * 	@returns {boolean}
	 */
	init()
	{
		if ( this.isInitialized() )
		{
			return true;
		}

		//
		//	create redis pool for received HTTP requests that been broadcast from other peers
		//
		const redisOptions = LocalParamUtils.getRedisOptions();
		console.log( `redisOptions :`, redisOptions );

		this.chPub = new ChPubService( redisOptions.port, redisOptions.host, {
			port : redisOptions.port,
			host : redisOptions.host,
			username : redisOptions.username,
			password : redisOptions.password,
			db : redisOptions.db
		} );
		this.chSub = new ChSubService( redisOptions.port, redisOptions.host, {
			port : redisOptions.port,
			host : redisOptions.host,
			username : redisOptions.username,
			password : redisOptions.password,
			db : redisOptions.db
		} );

		//	...
		return true;
	}

	/**
	 *	@return {boolean}
	 */
	isInitialized()
	{
		return ( !! this.chPub ) && ( !! this.chSub );
	}

	/**
	 * 	push http request to redis pool
	 *	@param p2pPackage	{ object }
	 *	@returns {Promise<boolean>}
	 */
	push( p2pPackage )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.chPub )
				{
					return reject( `${ this.constructor.name }.push :: not initialized` );
				}

				const errorP2pPackage = this.verifyP2pPackage( p2pPackage );
				if ( null !== errorP2pPackage )
				{
					return reject( `${ this.constructor.name }.push :: ${ errorP2pPackage }` );
				}

				const item = {
					topic : p2pPackage.topic,
					msgId : p2pPackage.msgId,
					from : p2pPackage.from.toString(),
					sequenceNumber : p2pPackage.sequenceNumber.toString(),
					body : p2pPackage.body,
				};
				const result = await this.chPub.publish( this.requestPoolName, item );
				resolve( result );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 *	@param callback	{function}
	 *	@returns {void}
	 */
	subscribe( callback )
	{
		if ( ! this.chSub || ! this.chPub )
		{
			throw Error( `${ this.constructor.name } :: not initialized` );
		}

		//
		//	process the Message request pool
		//
		const chSubOptions = {
			parseJSON : true
		};
		this.chSub.subscribe( this.requestPoolName, ( /** @type {string} **/ channel, /** @type {string} **/ message, /** @type {any} **/ options ) =>
		{
			console.log( `))) MessageRequestPool :: received message from channel [${channel}] : `, message );
			if ( _.isFunction( callback ) )
			{
				callback( channel, message, options );
			}

		}, chSubOptions );
	}

	verifyP2pPackage( p2pPackage )
	{
		if ( ! _.isObject( p2pPackage ) )
		{
			return `invalid p2pPackage`;
		}
		if ( ! _.every(
			[ 'type', 'topic', 'msgId', 'from', 'sequenceNumber', 'body' ],
				key => _.has( p2pPackage, key ) ) )
		{
			return `invalid p2pPackage[ keys ]`;
		}
		if ( ! _.isString( p2pPackage.type ) || _.isEmpty( p2pPackage.type ) )
		{
			return `invalid p2pPackage.type`;
		}
		if ( ! _.isString( p2pPackage.topic ) || _.isEmpty( p2pPackage.topic ) )
		{
			return `invalid p2pPackage.topic`;
		}
		if ( ! _.isString( p2pPackage.msgId ) || _.isEmpty( p2pPackage.msgId ) )
		{
			return `invalid p2pPackage.msgId`;
		}
		if ( ! _.isObject( p2pPackage.from ) )
		{
			return `invalid p2pPackage.from`;
		}
		if ( ! _.isBigInt( p2pPackage.sequenceNumber ) )
		{
			return `invalid p2pPackage.sequenceNumber`;
		}
		if ( ! _.isObject( p2pPackage.body ) &&
			_.isString( p2pPackage.body.serverId ) &&
			! _.isEmpty( p2pPackage.body.serverId ) &&
			_.isObject( p2pPackage.body.data ) )
		{
			return `invalid p2pPackage.body`;
		}

		return null;
	}
}
