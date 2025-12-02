export interface ScriptConfig {
  diskIdentifier: string;
  linuxDistro: string;
  issueDescription: string;
  targetArchitecture: string;
  includeOptimizations: boolean;
}

export interface GeneratedScript {
  content: string;
  explanation: string;
}