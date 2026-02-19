import { Module } from '@nestjs/common';
import { PBXManager } from './pbx.manager'

@Module({
    providers: [PBXManager],
    exports: [PBXManager]
})
export class PbxModule {}
