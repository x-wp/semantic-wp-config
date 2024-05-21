import type { BranchSpec } from 'semantic-release';
import { PackageType } from '../enums/package-type.enum';
import { PluginConfig } from '@semantic-release/wordpress/dist/classes/plugin-config.class';

export interface WpReleaseConfig {
  branches: BranchSpec[];
  commitOpts?: { [key: string]: unknown };
  type: PackageType;
  name: string;
  slug: string;
  changelog?: string | false;
  releaseAsset?: boolean;
  wp: Partial<PluginConfig>;
}
