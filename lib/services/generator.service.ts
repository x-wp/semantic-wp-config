import { SemanticWpConfig, WpReleaseConfig } from '../interfaces';
import path from 'node:path';
import fs from 'fs-extra';
import { PluginConfig } from '@semantic-release/wordpress/dist/classes/plugin-config.class';

export class Generator {
  constructor(
    private readonly defaults: Omit<WpReleaseConfig, 'name' | 'slug'>,
  ) {}

  generate(pkgConf: Partial<WpReleaseConfig>): SemanticWpConfig {
    const { wp, branches, ...cfg } = this.parsePkgConfig(pkgConf);

    const srConfig: SemanticWpConfig = {
      branches: branches,
      plugins: [],
    };

    if (cfg.changelog !== false) {
      srConfig.plugins.push([
        '@semantic-release/changelog',
        {
          changelogFile: cfg.changelog,
        },
      ]);
    }

    srConfig.plugins.push([
      '@semantic-release/commit-analyzer',
      cfg.commitOpts,
    ]);

    srConfig.plugins.push('@semantic-release/release-notes-generator');

    if (cfg.changelog !== false) {
      srConfig.plugins.push([
        '@semantic-release/git',
        {
          assets: [cfg.changelog],
          message:
            'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        },
      ]);
    }

    srConfig.plugins.push(['@semantic-release/wordpress', wp]);

    const assetName = cfg.type === 'plugin' ? cfg.slug : `${cfg.slug}-theme`;
    const assetLabel = cfg.type === 'plugin' ? cfg.name : `${cfg.name} Theme`;

    const ghAssets = [
      {
        path: path.join(wp.releasePath as string, 'package.zip'),
        label: assetLabel + ' v${nextRelease.version}',
        name: assetName + '-${nextRelease.version}.zip',
      },
    ];

    if (wp.withAssets) {
      ghAssets.push({
        path: path.join(wp.releasePath as string, 'assets.zip'),
        label: assetLabel + ' Assets v${nextRelease.version}',
        name: assetName + '-assets-${nextRelease.version}.zip',
      });
    }

    srConfig.plugins.push([
      '@semantic-release/github',
      {
        assets: ghAssets,
      },
    ]);

    return srConfig;
  }

  private parsePkgConfig({
    name,
    slug,
    wp,
    changelog,
    ...config
  }: Partial<WpReleaseConfig>): WpReleaseConfig {
    const def = this.defaults;
    slug = slug || path.basename(process.cwd());
    name = name || this.deslugify(slug);

    changelog = changelog || def.changelog;

    if (typeof changelog !== 'string' && changelog !== false) {
      changelog = 'CHANGELOG.md';
    }

    return {
      name: name,
      slug: slug,
      branches: config.branches || def.branches,
      type: config.type || def.type,
      changelog: changelog,
      releaseAsset: config.releaseAsset || def.releaseAsset,
      commitOpts: config.commitOpts || def.commitOpts,
      wp: {
        slug: slug,
        type: config.type || def.type,
        withAssets:
          wp?.withAssets || this.pathExists('.wordpress-org', 'assets'),
        withReadme:
          wp?.withReadme || this.pathExists('.wordpress-org', 'readme.txt'),
        withVersionFile: wp?.withVersionFile || def.wp.withVersionFile,
        versionFiles: wp?.versionFiles || def.wp.versionFiles,
        include: wp?.include || def.wp.include,
        exclude: wp?.exclude || def.wp.exclude,
        releasePath: wp?.releasePath || def.wp.releasePath,
      } as PluginConfig,
    };
  }

  private deslugify(slug: string): string {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private pathExists(...filePath: string[]): boolean {
    return fs.existsSync(path.posix.resolve(process.cwd(), ...filePath));
  }
}
