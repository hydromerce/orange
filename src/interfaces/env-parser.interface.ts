export interface EnvParser {
  parse(envVariables: Record<string, string>): Record<string, any>;
}
