import { Command } from 'commander';
import { createConfig } from './functions';

const { composer, release } = new Command()
  .enablePositionalOptions()
  .option(
    '-c, --composer [composer]',
    'Path to the composer.json file',
    'composer.json',
  )
  .option('-r, --release [release]', 'Release file', '.releaserc')
  .parse()
  .opts();

createConfig(composer, release);
