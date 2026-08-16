import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/social',
})
export class SocialGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocialGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`WebSocket client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WebSocket client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_account')
  handleSubscribeAccount(client: Socket, payload: { socialAccountId: string }) {
    if (payload?.socialAccountId) {
      client.join(`account_${payload.socialAccountId}`);
      this.logger.log(`Client ${client.id} subscribed to room account_${payload.socialAccountId}`);
      return { event: 'subscribed', room: `account_${payload.socialAccountId}` };
    }
  }

  emitAccountMetricsUpdated(socialAccountId: string, data: any) {
    this.logger.log(`Emitting real-time stats update for account ${socialAccountId}`);
    this.server.to(`account_${socialAccountId}`).emit('social_stats_updated', {
      socialAccountId,
      data,
      timestamp: new Date().toISOString(),
    });
    // Also emit broadcast event
    this.server.emit('global_stats_updated', {
      socialAccountId,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}
