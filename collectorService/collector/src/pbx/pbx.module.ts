import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PBXManager } from './pbx.manager';
import { PBXDataService } from '../supervisor/pbx-data.service';

@Module({
  imports: [HttpModule],
  providers: [
    PBXManager,
    PBXDataService,
  ],
  exports: [
    PBXManager,
    PBXDataService,
  ],
})
export class PbxModule {}