import { ReadStream } from 'fs';
import { Parser } from './parser.interface';
import { DotenvConfigOptions } from 'dotenv';
import { EnvParser } from './env-parser.interface';
import { ClassTransformOptions } from 'class-transformer';
import { ValidatorOptions } from 'class-validator';

/**
 * Function type used to locate files that should be read and parsed as config files.
 * @param env The environment variables that should be used to locate the file(s).
 * @returns The path(s) of the located file(s).
 */
export type FileLocatorFunction = (
  env: Record<string, string>,
) => string | string[];

/**
 * Type used to locate files that should be read and parsed as config files.
 */
export type FileLocator = string | FileLocatorFunction;

export interface ConfigurationModuleOptions {
  /**
   * A map of file extensions to parsers. If a file is encountered with an extension that matches a key in this map, the parser associated with that key will be used to parse the file.
   * If no parser is specified for a given extension, the file will be using the parser specified by the `defaultParser` option.
   *
   * @example
   * {
   *  '.yaml': new YamlParser(),
   *  '.json': new JsonParser(),
   * }
   */
  parsers?: { [extendsion: string]: new () => Parser };

  /**
   * If true the configuration object will be made available globaly using the @InjectConfig() decorator..
   */
  isGlobal?: boolean;

  /**
   * This parser will be used to parse files that do not have a parser specified in the `parsers` option.
   */
  defaultParser?: new () => Parser;

  /**
   * If true the dotenv module will be used to load environment variables from a `.env` file.
   * Configuration for dotenv can be specified in the `dotEnvConfig` option.
   */
  useDotenv?: boolean;

  /**
   * The parser that should be used to parse environment variables.
   */
  envParser?: new () => EnvParser;

  /**
   * Configuration for the dotenv module. Only is applied if the `useDotenv` option is true.
   */
  dotEnvConfig?: DotenvConfigOptions;

  /**
   * Options that should be passed to the class-transformer library when creating the configuration object.
   */
  classTransformerOptions?: ClassTransformOptions;

  /**
   * Options that should be passed to the class-validator library when validating the configuration object.
   */
  classValidatorOptions?: ValidatorOptions;

  /**
   * The path(s) to the file(s) that should be read and parsed as config files.
   * If dotenv is enable the `.env` file will be read first so that environment variables can be used in the file locator.
   */
  files?: FileLocator[];

  /**
   * If true no error will be logged if a configuration file could not be loaded.
   */
  suppressFailedFileLoads?: boolean;

  /**
   * The class that should be used to create the configuration object. This class should have decorators of the class validator library applied to it.
   */
  configClass: new () => any;
}
