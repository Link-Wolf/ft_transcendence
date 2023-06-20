import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';

@WebSocketGateway({
	cors: true
})
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('MessageGateway');

	@SubscribeMessage('msgToServer')
	handleMessage(client: Socket, payload: string): void {
		this.logger.log(`Client ${client.id} sent: ${payload}`);
		this.server.emit('msgToClient', payload);
	}

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	notifyUpdate(
		channel: string,
	) {
		this.server.emit("newMessage", channel);
	}
}