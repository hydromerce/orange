import { Inject } from '@nestjs/common';
import { CONFIG_TOKEN } from './symbols/config.token';

export const InjectConfig = () => Inject(CONFIG_TOKEN);
