import { SemanticWpConfig, WpReleaseConfig } from '../interfaces';
import path from 'node:path';
import fs from 'fs-extra';
import * as Default from '../config';
import { PluginConfig } from '@semantic-release/wordpress/dist/classes/plugin-config.class';

export class Generator {
  private composerJSON!: Omit<WpReleaseConfig, 'type'>;
  private releaseRC!: SemanticWpConfig;

  parse(composerFile: string): this {
    composerFile = path.posix.resolve(composerFile);
    const cfg: Partial<WpReleaseConfig> =
      fs.readJSONSync(composerFile)?.extra?.release ?? {};

    cfg.slug = cfg?.slug || path.basename(composerFile);
    cfg.name = cfg?.name || this.deslugify(cfg.slug);

    cfg.changelog = cfg?.changelog ?? false;
    cfg.wp = cfg.wp ?? {};
    cfg.wp.path = cfg.wp?.path ?? './';

    if (typeof cfg.changelog !== 'string' && cfg.changelog !== false) {
      cfg.changelog = 'CHANGELOG.md';
    }

    this.composerJSON = {
      name: cfg.name,
      slug: cfg.slug,
      branches: cfg.branches ?? Default.branches,
      changelog: cfg.changelog,
      ghAsset: cfg?.ghAsset ?? true,
      commitMsgOpts: cfg?.commitMsgOpts ?? Default.commitAnalyzer,
      releaseNoteOpts: cfg?.releaseNoteOpts ?? Default.releaseNotesGenerator,
      wp: {
        slug: cfg.slug,
        type: cfg?.type ?? 'plugin',
        path: cfg.wp.path,
        withAssets:
          cfg.wp?.withAssets ??
          this.pathExists(cfg.wp.path, '.wordpress-org', 'assets'),
        withReadme:
          cfg.wp?.withReadme ??
          this.pathExists(cfg.wp.path, '.wordpress-org', 'readme.txt'),
        withVersionFile: cfg.wp?.withVersionFile ?? true,
        versionFiles: cfg.wp?.versionFiles ?? [],
        include: cfg.wp?.include ?? undefined,
        exclude: cfg.wp?.exclude ?? undefined,
        releasePath: cfg.wp?.releasePath ?? '/tmp/wp-release',
      } as PluginConfig,
    };

    return this;
  }

  create(): this {
    const { wp, branches, ...cfg } = this.composerJSON;

    this.releaseRC = {
      branches,
      plugins: [],
    };

    if (cfg.changelog !== false) {
      this.releaseRC.plugins.push([
        '@semantic-release/changelog',
        {
          changelogFile: cfg.changelog,
        },
      ]);
    }

    this.releaseRC.plugins.push([
      '@semantic-release/commit-analyzer',
      cfg.commitMsgOpts,
    ]);

    this.releaseRC.plugins.push([
      '@semantic-release/release-notes-generator',
      cfg.releaseNoteOpts,
    ]);

    if (cfg.changelog !== false) {
      this.releaseRC.plugins.push([
        '@semantic-release/git',
        {
          assets: [cfg.changelog],
          message:
            'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        },
      ]);
    }

    this.releaseRC.plugins.push(['@semantic-release/wordpress', wp]);

    const assetName = wp.type === 'plugin' ? cfg.slug : `${cfg.slug}-theme`;
    const assetLabel = wp.type === 'plugin' ? cfg.name : `${cfg.name} Theme`;

    const ghAssets = [
      {
        path: path.join(wp.releasePath as string, 'package.zip'),
        label: assetLabel + ' v${nextRelease.version}',
        name: assetName + '-v${nextRelease.version}.zip',
      },
    ];

    if (wp.withAssets) {
      ghAssets.push({
        path: path.join(wp.releasePath as string, 'assets.zip'),
        label: assetLabel + ' Assets v${nextRelease.version}',
        name: assetName + '-assets-v${nextRelease.version}.zip',
      });
    }

    this.releaseRC.plugins.push([
      '@semantic-release/github',
      {
        assets: ghAssets,
      },
    ]);

    return this;
  }

  write(releaseFile: string): void {
    releaseFile = path.posix.resolve(releaseFile);
    fs.writeJSONSync(releaseFile, this.releaseRC, {
      encoding: 'utf-8',
      spaces: 2,
      flag: 'w',
    });
  }

  get(): SemanticWpConfig {
    return this.releaseRC;
  }

  private deslugify(slug: string): string {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private pathExists(...filePath: string[]): boolean {
    return fs.existsSync(path.posix.resolve(...filePath));
  }
}
