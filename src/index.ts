import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

const reqOptions = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
  },
};

export class GoogleFontsDownloader {
  constructor(public styleLink: string, public destinationFolder: string) {}

  async run() {
    if (!fs.existsSync(this.destinationFolder)) {
      fs.mkdirSync(this.destinationFolder);
    }

    // Download style
    const styleContent = await this.getUrlContent(this.styleLink);

    const lines = styleContent.split('\n');

    let unicodeRange = '';
    let family = '';
    let style = '';
    let weight = '';

    let resultStyle = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      let match: RegExpMatchArray | null;

      if ((match = line.match(/^\/\* (.*) \*\/$/))) {
        unicodeRange = match[1].replace(/\s/g, '');
      }
      if ((match = line.match(/\s*font-family: '(.*)';/))) {
        family = match[1].replace(/\s/g, '');
      }
      if ((match = line.match(/\s*font-style: (.*);/))) {
        style = match[1];
      }
      if ((match = line.match(/\s*font-weight: (.*);/))) {
        weight = match[1];
      }
      if ((match = line.match(/\s*src: url\((.*)\) format\('woff2'\);/))) {
        const url = match[1];

        const newFileName = `${family}_${unicodeRange}_${style}-${weight}.woff2`;
        await this.downloadFile(url, `${this.destinationFolder}/${newFileName}`);
        line = line.replace(url, newFileName);
      }

      resultStyle += line + '\n';
    }

    await this.writeContentToFile(resultStyle, `${this.destinationFolder}/style.css`);
  }

  async downloadFile(url: string, dest: string) {
    return new Promise<void>((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      const client = url.toString().startsWith('https') ? https : http;

      client
        .get(url, reqOptions, function (response) {
          response.pipe(file);
          file.on('finish', function () {
            file.close(() => {
              resolve();
            });
          });
        })
        .on('error', function (err) {
          fs.unlink(dest, () => {
            reject(err.message);
          });
        });
    });
  }

  async getUrlContent(url: string) {
    return new Promise<string>((resolve, reject) => {
      const client = url.toString().startsWith('https') ? https : http;

      client
        .get(url, reqOptions, (resp) => {
          let data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            resolve(data);
          });
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  async writeContentToFile(content: string, dest: string) {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(dest, content, function (err) {
        if (err) {
          return reject(err.message);
        }

        return resolve();
      });
    });
  }
}
