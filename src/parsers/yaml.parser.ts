import * as yaml from 'js-yaml';
import { Parser } from '../interfaces/parser.interface';

export class YamlParser implements Parser {
  parse(content: string): any {
    return yaml.load(content);
  }
}
