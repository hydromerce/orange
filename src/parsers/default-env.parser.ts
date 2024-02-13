import { EnvParser } from '../interfaces/env-parser.interface';

export class DefaultEnvParser implements EnvParser {
  parse(envVariables: Record<string, string>): Record<string, any> {
    const result = {};
    Object.keys(envVariables).forEach((key) => {
      const path = this.transformKey(key);
      this.setValue(result, path, envVariables[key]);
    });
    return result;
  }

  private transformKey(key: string): string[] {
    return key
      .toLowerCase()
      .split('__')
      .map((part) =>
        part.replace(/_(.)/g, (match, group1) => group1.toUpperCase()),
      );
  }

  private setValue(obj: any, path: string[], value: any): void {
    path.reduce((acc, part, index) => {
      // if the path does not exist create a new object
      const partData = this.parsePathPart(part);

      if (partData.isArray) {
        // if the given path is already an object throw an error. As it probably is a conflicting path.
        if (acc[partData.key] && !Array.isArray(acc[partData.key])) {
          throw new Error(
            `Cannot turn object into array. Key: ${path.join('__')}`,
          );
        }

        // if the path part does not exist create a new array
        if (!acc[partData.key]) acc[partData.key] = [];

        // if the array index does not exist expand the array to the required size
        while (acc[partData.key].length <= partData.arrayIndex) {
          acc[partData.key].push({});
        }
      }

      // if last item in the path set the value
      if (index === path.length - 1) {
        if (partData.isArray) {
          // return the next object in the path
          acc[partData.key][partData.arrayIndex] = value;
        } else {
          acc[part] = value;
        }
      } else {
        if (partData.isArray) {
          // return the next object in the path
          return acc[partData.key][partData.arrayIndex];
        }

        // if the path part does not exist create a new object
        if (!acc[part]) acc[part] = {};

        // return the next object in the path
      }
      return acc[part];
    }, obj);
  }

  /**
   * Parses the given path part. The path part is an array if it is suffixed by "-" and a number where the
   * number represents the index of the array.
   * @param part The part to parse
   */
  private parsePathPart(part: string): {
    isArray: boolean;
    key: string;
    arrayIndex?: number;
  } {
    if (part.match(/.*-\d+$/)) {
      const [key, index] = part.split('-');
      return { isArray: true, key, arrayIndex: parseInt(index, 10) };
    }

    return { isArray: false, key: part };
  }
}
