import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationService } from './notification.service';

@Module({
  imports: [AuthModule],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationGateway],
})
export class NotificationModule {}
