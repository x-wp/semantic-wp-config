import type { BranchSpec } from 'semantic-release';
import { PluginConfig } from '@semantic-release/wordpress/dist/classes/plugin-config.class';

export interface WpReleaseConfig {
  branches: BranchSpec[];
  commitMsgOpts?: { [key: string]: unknown };
  releaseNoteOpts?: { [key: string]: unknown };
  type: 'plugin' | 'theme';
  name: string;
  slug: string;
  changelog?: boolean | string;
  ghAsset?: boolean;
  wp: Partial<PluginConfig>;
}
