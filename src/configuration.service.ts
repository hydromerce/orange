import { Inject, Injectable } from '@nestjs/common';
import {
  ConfigurationModuleOptions,
  FileLocator,
} from './interfaces/config-options.interface';
import dotenv from 'dotenv';
import { MODULE_OPTION_TOKEN } from './symbols/module-config.token';
import { defaultOptions } from './default.options';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Parser } from './interfaces/parser.interface';
import { readFileSync } from 'fs';
import _ from 'lodash';
import { validateSync } from 'class-validator';

/**
 *
 * A service for managing configuration options in a NestJS application.
 * This service can load configuration from files, parse them using specified parsers,
 * and merge them into a single configuration object. It can also load environment variables
 * from a .env file if configured to do so.
 */
@Injectable()
export class ConfigurationService<T> {
  /**
   * The generated and validated configuration object.
   */
  public config: T;

  /**
   * @param options - The configuration options for the module.
   */
  public constructor(
    @Inject(MODULE_OPTION_TOKEN)
    private readonly options: ConfigurationModuleOptions,
  ) {
    _.defaultsDeep(this.options, defaultOptions);
    this.initialize();
  }

  /**
   * Initializes the service by loading the .env file (if configured to do so)
   * and loading and parsing the configuration files.
   */
  private initialize(): void {
    if (this.options.useDotenv) {
      this.loadDotEnv();
    }

    const wholeConfiguration = this.loadConfigurationFiles();
    const envConfig = this.loadEnvConfiguration();
    _.merge(wholeConfiguration, envConfig);

    const configInstance = plainToClass(
      this.options.configClass,
      wholeConfiguration,
      this.options.classTransformerOptions,
    );

    this.validateConfiguration(configInstance);

    this.config = configInstance;
  }

  /**
   * Validates the configuration object using the class-validator library.
   * @param configuration The configuration object to validate.
   */
  private validateConfiguration(configuration: any): void {
    const errors = validateSync(
      configuration,
      this.options.classValidatorOptions,
    );

    if (errors.length > 0) {
      console.error('Configuration validation failed on object:');
      console.dir(configuration, { depth: null });
      console.error(`Configuration validation error: ${errors.toString()}`);
      throw new Error(
        'Confguration validation failed. Please check the logs above for more information.',
      );
    }
  }

  /**
   * Loads and parses environment variables using the parser specified in the options.
   * @returns The configuration object.
   */
  private loadEnvConfiguration(): Record<string, any> {
    const envParser = new this.options.envParser();
    const envConfig = envParser.parse(process.env);

    return envConfig;
  }

  /**
   * Loads and parses the configuration files specified in the options.
   * @returns The merged configuration object.
   */
  private loadConfigurationFiles(): Record<string, any> {
    const filesToLoad = this.getAllFilesToLoad();

    const extractedConfig: Record<string, any> = {};
    for (const path of filesToLoad) {
      const parser = this.getParserForPath(path);

      const parsedData = this.loadAndParseFile(path, parser);

      _.merge(extractedConfig, parsedData);
    }

    return extractedConfig;
  }

  /**
   * Loads and parses a single configuration file.
   * @param path - The path to the configuration file.
   * @param parser - The parser to use for parsing the file.
   * @returns The parsed configuration object.
   */
  private loadAndParseFile(path: string, parser: Parser): Record<string, any> {
    try {
      const fileContent = readFileSync(path, 'utf-8');

      const parsedConfig = parser.parse(fileContent);

      return parsedConfig;
    } catch (error) {
      console.error(`Unable to load file at path ${path}.`, error);
      return {};
    }
  }
  /**
   * Gets all the file paths to load from the file locators specified in the options.
   * @returns The array of file paths to load.
   */
  private getAllFilesToLoad(): string[] {
    const filesToLoad: string[] = [];
    for (const locator of this.options.files) {
      let paths = this.getPathsFromLocator(locator);

      for (const path of paths) {
        if (!filesToLoad.includes(path)) {
          filesToLoad.push(path);
        }
      }
    }
    return filesToLoad;
  }

  /**
   * Gets the file paths from a file locator.
   * @param locator - The file locator.
   * @returns The array of file paths from the locator.
   */
  private getPathsFromLocator(locator: FileLocator): string[] {
    if (locator instanceof Function) {
      const res = locator(process.env);

      if (Array.isArray(res)) {
        return res;
      }

      return [res];
    }

    return [locator];
  }

  /**
   * Gets the parser for a file path based on its extension.
   * @param path - The file path.
   * @returns The parser for the file.
   */
  private getParserForPath(path: string): Parser {
    const extension = path.slice(path.lastIndexOf('.'));

    if (this.options.parsers[extension]) {
      return new this.options.parsers[extension]();
    }

    return new this.options.defaultParser();
  }

  /**
   * Loads environment variables from a .env file using the 'dotenv' module.
   */
  private loadDotEnv(): void {
    dotenv.config(this.options.dotEnvConfig);
  }
}
