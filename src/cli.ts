import { GoogleFontsDownloader } from './index';

const cli = require('cac')('google-fonts-downloader');

cli
  .option('--style, -s <type>', 'Style link href')
  .example(
    '--style https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500',
  );

cli.option('--dir, -d <dir>', 'Output directory', {
  default: './',
}).example(
  '--dir ./output',
);

// Display help message when `-h` or `--help` appears
cli.help();

const parsed = cli.parse();

if (!parsed.options.style) {
  console.log('Error: Style options is required!');
  process.exit(1);
}

(async () => {
  try {
    const gfd = new GoogleFontsDownloader(parsed.options.style, parsed.options.dir);
    await gfd.run();
    console.log('Done!');
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
