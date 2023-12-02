import _ from "lodash";
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from "socket.io";

import { TestUtil } from "denetwork-utils";
import { ParamUtils } from "../utils/ParamUtils.js";

import denetwork_chat_client from "denetwork-chat-client";
const { BroadcastCallback } = denetwork_chat_client;

import { ChatServer } from 'denetwork-chat-server';
import denetwork_chat_server from 'denetwork-chat-server';
const { ServerOptions, RedisOptions } = denetwork_chat_server;

import { enable } from "@libp2p/logger";
enable( 'denetwork-chat-server:SendMessageHandler' );

import 'deyml/config';


/**
 *	@type {number}
 */
const chatPort = ParamUtils.getChatPort();

//	...
const expressServer = express();
const httpServer = http.createServer( expressServer );
const socketServerOptions = {
	cors : {
		origin : "*",
		credentials : true
	}
};
const ioServer = new SocketIOServer( httpServer, socketServerOptions );

/**
 *	@type {ChatServer}
 */
let chatServer = null;



/**
 * 	@param p2pRelay		{ChatP2pRelay}
 *	@returns {Promise<http.Server>}
 */
export function startChatServer( p2pRelay )
{
	return new Promise( async ( resolve, reject ) =>
	{
		try
		{
			if ( ! TestUtil.isTestEnv() )
			{
				console.log( `process.env :`, process.env );
			}

			/**
			 *	configurations
			 */
			expressServer.disable( 'x-powered-by' );
			expressServer.use( express.static( 'public' ) );	//	static files
			expressServer.use( express.json() );
			expressServer.use( express.urlencoded( { extended : true } ) );

			//	...
			const listenServer = httpServer.listen( chatPort, () =>
			{
				if ( TestUtil.isTestEnv() )
				{
					return false;
				}

				/**
				 *	@typedef {import('net').AddressInfo} AddressInfo
				 *	@type {AddressInfo}
				 */
				const address = httpServer.address();
				//const host = address.address;

				console.log( `))) Metabeem Chat Server listening on port ${ address.port }` );
			} );

			//
			//	HTTP events
			//
			expressServer.on( 'error', ( appErr, appCtx ) =>
			{
				console.error( 'app error', appErr.stack );
				console.error( 'on url', appCtx.req.url );
				console.error( 'with headers', appCtx.req.headers );
			} );

			/**
			 * 	@type {BroadcastCallback}
			 */
			const onSendMessageCallback = ( /** @type {string} */ serverId, /** @type {any} */ data, /** @type {any} */ options ) =>
			{
				console.log( `::onSendMessageCallback :`, serverId, data, options );
				if ( p2pRelay )
				{
					console.log( `:: will publish over p2p network` );
					//	publish to p2p network
					p2pRelay.publish({
						serverId : serverId,
						data : data,
						options : options
					});
				}
				else
				{
					console.log( `:: p2p network not ready` );
				}

				return true;
			};

			/**
			 * 	@type {ServerOptions}
			 */
			const chatServerOptions = {
				ioServer: ioServer,
				serverId: null,
				onSendMessageCallback: onSendMessageCallback,
				redisOptions : ParamUtils.getRedisOptions(),
			};
			chatServer = new ChatServer( chatServerOptions );

			/**
			 * 	subscribe to broadcasts from the p2p network and
			 * 	resend to the specified room if the room exists locally
			 */
			if ( p2pRelay )
			{
				p2pRelay.messageRequestPool.subscribe( ( /** @type {string} **/ _channel, /** @type {string} **/ message, /** @type {any} **/ options ) =>
				{
					console.log( `|||||| get a message from messageRequestPool over p2p network :`, _channel, message, options );
					if ( _.isObject( message ) )
					{
						console.log( `|||||| will call chatServer.sendMessageToRoom :`, message );
						chatServer.sendMessageToRoom( message );
					}
					else
					{
						console.log( `|||||| message is not an object :`, message );
					}
				});
			}
			else
			{
				console.log( `|||||| p2pRelay not ready!!!!!!` );
			}

			//	...
			resolve( listenServer );
		}
		catch ( err )
		{
			reject( err );
		}
	} );
}

export const app = expressServer;
