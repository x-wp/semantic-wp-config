declare type ConfigOpts = {
  branches: string[];
  type: 'plugin' | 'theme';
  name: string;
  changelog: string;
  files: File[];
};

declare type VersionType = 'readme' | 'header' | 'constant';

declare type File = {
  path: string[];
  type: VersionType;
};

declare type SemanticReleaseConfig = {
  branches: string[];
  plugins: SemanticReleasePluginConfig[];
};

declare type SemanticReleasePluginConfig = [string, any] | string;

export function generateConfig(opts: ConfigOpts): SemanticReleaseConfig {
  const regexes: Record<
    VersionType,
    { from: RegExp | string; to: RegExp | string }
  > = {
    header: {
      from: /^(\s*\*\s*Version:\s+)\K.*/,
      to: '${1}${nextRelease.version}',
    },
    readme: {
      from: /^Stable tag:\s*(\S+)/,
      to: 'Stable tag: ${nextRelease.version}',
    },
    constant: {
      from: /define\(\s+'(\w+)', '(\d.\d.\d)'\s+\)/,
      to: "define('${1}', '${nextRelease.version}')",
    },
  };
  const baseConfig: SemanticReleaseConfig = {
    branches: opts?.branches ?? ['master', 'main'],
    plugins: [],
  };

  const files =
    opts?.files?.map((file) => {
      return {
        files: file.path,
        from: regexes[file.type].from,
        to: regexes[file.type].to,
        results: file.path.map((path) => ({
          file: path,
          hasChanged: true,
          numMatches: 1,
          numReplacements: 1,
        })),
        countMatches: true,
      };
    }) ?? [];

  if (opts.type === 'plugin') {
    files.push({
      files: [`${opts.name}.php`],
      from: regexes.header.from,
      to: regexes.header.to,
      results: [
        {
          file: `${opts.name}.php`,
          hasChanged: true,
          numMatches: 1,
          numReplacements: 1,
        },
      ],
      countMatches: true,
    });
  }

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

  baseConfig.plugins.push([
    '@semantic-release/exec',
    {
      prepareCmd: 'echo "${nextRelease.version}" > /tmp/VERSION',
    },
  ]);

  if (files?.length > 0) {
    baseConfig.plugins.push([
      'semantic-release-replace-plugin',
      {
        replacements: files,
      },
    ]);
  }

  if (files?.length > 0 && opts?.changelog) {
    baseConfig.plugins.push([
      '@semantic-release/git',
      {
        assets: [opts.changelog, new Set(files.map((file) => file.files))],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ]);
  }

  baseConfig.plugins.push([
    '@semantic-release/github',
    {
      assets: [
        {
          path: '/tmp/release.zip',
          label: 'Version ${nextRelease.version}',
          name: opts.name + '-${nextRelease.version}.zip',
        },
      ],
    },
  ]);

  return baseConfig;
  //   plugins: [
  //     [
  //       '@semantic-release/changelog',
  //       {
  //         changelogFile: 'CHANGELOG.md',
  //       },
  //     ],
  //     '@semantic-release/commit-analyzer',
  //     '@semantic-release/release-notes-generator',
  //     [
  //       '@semantic-release/git',
  //       {
  //         assets: ['CHANGELOG.md', 'anci-product-manager.php'],
  //         message:
  //           'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
  //       },
  //     ],
  //     [
  //       '@semantic-release/github',
  //       {
  //         assets: [
  //           {
  //             path: '/tmp/release.zip',
  //             label: 'Version ${nextRelease.version}',
  //             name: 'anci-product-manager-${nextRelease.version}.zip',
  //           },
  //         ],
  //       },
  //     ],
  //   ],
  // };
}
