import { createConfig } from '../lib/functions';
import * as path from 'node:path';

const basePath = './test/fixtures';

describe('GenerateConfig FN', () => {
  it('should generate a config', async () => {
    const composer = path.posix.resolve(
      `${basePath}/plugin-with-assets/composer.json`,
    );
    const release = path.posix.resolve(
      `${basePath}/plugin-with-assets/.releaserc`,
    );

    expect(createConfig(composer, release)).not.toEqual({});
  });
});
