import { Parser } from '../interfaces/parser.interface';

export class JsonParser implements Parser {
  parse(content: string): any {
    return JSON.parse(content);
  }
}
