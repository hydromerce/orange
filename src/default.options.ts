import { ConfigurationModuleOptions } from './interfaces/config-options.interface';
import { DefaultEnvParser } from './parsers/default-env.parser';
import { JsonParser } from './parsers/json.parser';
import { YamlParser } from './parsers/yaml.parser';

export const defaultOptions: ConfigurationModuleOptions = {
  useDotenv: false,
  dotEnvConfig: {},
  defaultParser: JsonParser,
  parsers: {
    '.json': JsonParser,
    '.yaml': YamlParser,
    '.yml': YamlParser,
  },
  files: [],
  suppressFailedFileLoads: false,
  envParser: DefaultEnvParser,
  configClass: undefined,
  classTransformerOptions: {
    enableImplicitConversion: true,
  },
  classValidatorOptions: {},
};
