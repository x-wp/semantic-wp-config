import { Generator } from '../services';

export function createConfig(composer: string, release: string) {
  new Generator().parse(composer).create().write(release);
}
