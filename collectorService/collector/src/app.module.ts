import { Logger, Module, OnModuleInit } from '@nestjs/common';
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
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ServicesModule } from './services/services.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PbxModule,
    ScheduleModule.forRoot(),
    PersistenceModule,
    TransportModule,
    SupervisorModule,
    HealthModule,
    EndpointsModule,
    ServicesModule,
    EventsModule,
    NetworkModule,
    TypeOrmModule.forRoot(databaseConfig),
  ],
  controllers: [ApiController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);
  
  onModuleInit() {
    this.logger.log('✅ AppModule initialized - all services should be loaded');
  }
}
