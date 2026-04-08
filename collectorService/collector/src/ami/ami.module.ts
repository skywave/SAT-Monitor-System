// src/ami/ami.module.ts
import { Module } from '@nestjs/common';
import { AMIService } from './ami.service';

@Module({
  providers: [AMIService],
  exports: [AMIService],  
})
export class AMIModule {}