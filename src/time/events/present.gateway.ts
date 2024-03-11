import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'present',
  cors: {
    origin: '*',
  },
})
export class PresentGateway {
  @WebSocketServer()
  server: Server;

  presentUpdate(data: any): void {
    this.server.emit('present-update', data);
  }
}
