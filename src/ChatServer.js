import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from "socket.io";

import { TestUtil } from "denetwork-utils";
import { ParamUtils } from "./utils/ParamUtils.js";

import denetwork_chat_client from "denetwork-chat-client";
const { BroadcastCallback } = denetwork_chat_client;

import { ChatServer } from 'denetwork-chat-server';
import denetwork_chat_server from 'denetwork-chat-server';
const { ChatServerOptions } = denetwork_chat_server;

import { enable } from "@libp2p/logger";
enable( 'denetwork-chat-server:SendMessageHandler' );

import 'dotenv/config.js'


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
 *	@returns {Promise<http.Server>}
 */
export function startServer()
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

			//
			//	WebSocket events
			//
			/**
			 * 	@type {BroadcastCallback}
			 */
			const broadcastCallback = ( /** @type {string} */ serverId, /** @type {any} */ data, /** @type {any} */ options ) =>
			{
				console.log( `::broadcastCallback :`, serverId, data, options );
				return true;
			};

			/**
			 * 	@type {ChatServerOptions}
			 */
			const chatServerOptions = {
				ioServer: ioServer,
				serverId: null,
				broadcastCallback: broadcastCallback,
				redisOptions : ParamUtils.getRedisOptions(),
			};
			console.log( `will create ChatServer with options: `, chatServerOptions );
			chatServer = new ChatServer( chatServerOptions );

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
