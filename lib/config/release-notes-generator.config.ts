export const releaseNotesGenerator = {
  preset: 'conventionalcommits',
  presetConfig: {
    types: [
      {
        type: 'feat',
        section: ':sparkles: Features',
        hidden: false,
      },
      {
        type: 'fix',
        section: ':bug: Bug Fixes',
        hidden: false,
      },
      {
        type: 'compat',
        section: ':gear: Compatibility',
        hidden: false,
      },
      {
        type: 'refactor',
        section: ':recycle: Refactor',
        hidden: false,
      },
      {
        type: 'style',
        section: ':art: Code style',
        hidden: false,
      },
      {
        type: 'perf',
        section: ':rocket: Performance',
        hidden: false,
      },
      {
        type: 'chore',
        section: ':wrench: Maintenance',
        hidden: false,
      },
    ],
  },
};
