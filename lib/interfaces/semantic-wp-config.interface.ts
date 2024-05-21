import type { PluginSpec, BranchSpec } from 'semantic-release';

export interface SemanticWpConfig {
  branches: BranchSpec[];
  plugins: PluginSpec[];
}
