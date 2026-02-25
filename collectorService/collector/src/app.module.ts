import { Module } from '@nestjs/common';
import { ApiController } from './app.controller';
import { AppService } from './app.service';
import { PbxModule } from './pbx/pbx.module';
import { PersistenceModule } from './persistence/persistence.module';
import { TransportModule } from './transport/transport.module';
import { SupervisorModule } from './supervisor/supervisor.module';
import { HealthModule } from './health/health.module';
import { EndpointsModule } from './endpoints/endpoints.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [PbxModule, PersistenceModule, TransportModule, SupervisorModule, HealthModule, EndpointsModule, EventsModule],
  controllers: [ApiController],
  providers: [AppService],
})
export class AppModule {}
