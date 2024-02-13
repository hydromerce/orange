import { DynamicModule, Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationModuleOptions } from './interfaces/config-options.interface';
import { MODULE_OPTION_TOKEN } from './symbols/module-config.token';
import { CONFIG_TOKEN } from './symbols/config.token';

@Module({})
export class ConfigurationModule {
  static forRoot(options: ConfigurationModuleOptions): DynamicModule {
    return {
      module: ConfigurationModule,
      global: options.isGlobal,
      providers: [
        {
          provide: MODULE_OPTION_TOKEN,
          useValue: options,
        },
        ConfigurationService,
        {
          provide: CONFIG_TOKEN,
          useFactory: (configService: ConfigurationService<any>) =>
            configService.config,
          inject: [ConfigurationService],
        },
      ],
      exports: [ConfigurationService, CONFIG_TOKEN],
    };
  }
}
