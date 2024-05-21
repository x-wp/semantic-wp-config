import { PackageType } from '../enums';
import { SemanticWpConfig, WpReleaseConfig } from '../interfaces';
import { Generator } from '../services';

const defaults: Omit<WpReleaseConfig, 'name' | 'slug'> = {
  branches: [
    'master',
    {
      name: 'alpha',
      prerelease: true,
    },
    {
      name: 'beta',
      prerelease: true,
    },
  ],
  commitOpts: {
    preset: 'angular',
    releaseRules: [
      { type: 'refactor', release: 'patch' },
      { type: 'style', release: 'patch' },
    ],
    parserOpts: {
      noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
    },
  },
  type: PackageType.Plugin,
  changelog: false,
  releaseAsset: true,
  wp: {
    withVersionFile: true,
    releasePath: '/tmp/wp-release',
    versionFiles: [],
    include: undefined,
    exclude: undefined,
  },
};

export function generateConfig(
  config: Partial<WpReleaseConfig>,
): SemanticWpConfig {
  return new Generator(defaults).generate(config);
}
