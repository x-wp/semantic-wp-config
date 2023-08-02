import * as path from 'node:path';

declare type ConfigOpts = {
  branches: string[];
  type: 'plugin' | 'theme';
  name: string;
  slug: string;
  changelog: string;
  files: File[];
  publishAssets: boolean;
  wp: {
    withAssets?: boolean;
    withReadme?: boolean;
    withVersionFile?: boolean;
    releasePath?: string;
    versionFiles?: string[];
    include?: string[];
    exclude?: string[];
  };
};

declare type SemanticReleaseConfig = {
  branches: string[];
  plugins: SemanticReleasePluginConfig[];
};

declare type SemanticReleasePluginConfig = [string, any] | string;

export function generateConfig(opts: ConfigOpts): SemanticReleaseConfig {
  const baseConfig: SemanticReleaseConfig = {
    branches: opts.branches,
    plugins: [],
  };

  if (opts?.changelog) {
    baseConfig.plugins.push([
      '@semantic-release/changelog',
      {
        changelogFile: opts.changelog,
      },
    ]);
  }

  baseConfig.plugins.push('@semantic-release/commit-analyzer');
  baseConfig.plugins.push('@semantic-release/release-notes-generator');

  if (opts?.changelog) {
    baseConfig.plugins.push([
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ]);
  }

  baseConfig.plugins.push([
    'semantic-release-wp-plugin',
    {
      type: opts.type,
      slug: opts.slug,
      withAssets: opts?.wp?.withAssets ?? false,
      withReadme: opts?.wp?.withReadme ?? false,
      withVersionFile: opts?.wp?.withVersionFile ?? true,
      releasePath: opts?.wp?.releasePath ?? '/tmp/wp-release',
      versionFiles: opts?.wp?.versionFiles ?? [],
      include: opts?.wp?.include ?? undefined,
      exclude: opts?.wp?.exclude ?? undefined,
    },
  ]);

  const assetName = opts.type === 'plugin' ? opts.slug : `${opts.slug}-theme`;
  const assetLabel = opts.type === 'plugin' ? opts.name : `${opts.name} Theme`;

  const ghAssets = [
    {
      path: path.join(
        opts?.wp?.releasePath ?? '/tmp/wp-release',
        'package.zip',
      ),
      label: assetName + ' v${nextRelease.version}',
      name: assetLabel + '-${nextRelease.version}.zip',
    },
  ];

  if (opts?.publishAssets) {
    ghAssets.push({
      path: path.join(opts?.wp?.releasePath ?? '/tmp/wp-release', 'assets.zip'),
      label: assetName + ' Assets v${nextRelease.version}',
      name: assetLabel + '-assets-${nextRelease.version}.zip',
    });
  }

  baseConfig.plugins.push([
    '@semantic-release/github',
    {
      assets: ghAssets,
    },
  ]);

  return baseConfig;
}
