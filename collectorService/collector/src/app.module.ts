import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './app.controller';
import { AppService } from './app.service';
import { PbxModule } from './pbx/pbx.module';
import { PersistenceModule } from './persistence/persistence.module';
import { TransportModule } from './transport/transport.module';
import { SupervisorModule } from './supervisor/supervisor.module';
import { HealthModule } from './health/health.module';
import { EndpointsModule } from './endpoints/endpoints.module';
import { EventsModule } from './events/events.module';
import { NetworkModule } from './network/network.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PbxModule,
    PersistenceModule,
    TransportModule,
    SupervisorModule,
    HealthModule,
    EndpointsModule,
    EventsModule,
    NetworkModule,
  ],
  controllers: [ApiController],
  providers: [AppService],
})
export class AppModule {}
