export const commitAnalyzer = {
  preset: 'conventionalcommits',
  releaseRules: [
    {
      type: 'chore',
      release: false,
    },
    {
      type: 'perf',
      release: 'patch',
    },
    {
      type: 'compat',
      release: 'patch',
    },
    {
      type: 'refactor',
      release: 'patch',
    },
    {
      type: 'style',
      release: 'patch',
    },
  ],
  parserOpts: {
    noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
  },
};
