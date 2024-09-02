import fs from 'fs';
import https from 'https';
import { promisify } from 'util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cliProgress from 'cli-progress';
import unzipper from 'unzipper';
import { x as tarExtract } from 'tar';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mkdirAsync = promisify(fs.mkdir);
const readdirAsync = promisify(fs.readdir);

const downloadTasks = [
  {
    url: 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.12.zip',
    to: 'mongodb/win32',
  },
  {
    url: 'https://fastdl.mongodb.org/osx/mongodb-macos-arm64-7.0.12.tgz',
    to: 'mongodb/darwin',
  },
];

const multiBar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {percentage}% | {value}/{total} Bytes | {task}',
  },
  cliProgress.Presets.shades_classic
);

const downloadAndExtractFile = async (task) => {
  const dirPath = path.join(__dirname, task.to);

  // Ensure the directory exists
  await mkdirAsync(dirPath, { recursive: true });

  // Check if the directory already contains files
  try {
    const files = await readdirAsync(dirPath);
    if (files.length > 0) {
      console.log(`Skipping download, directory not empty: ${dirPath}`);
      return;
    }
  } catch (err) {
    // Directory might not exist; we created it above
  }

  return new Promise((resolve, reject) => {
    https.get(task.url, (response) => {
      const totalSize = parseInt(response.headers['content-length'] || '0', 10);

      if (totalSize > 0) {
        const progressBar = multiBar.create(totalSize, 0, { task: task.to });
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          progressBar.update(downloadedSize);
        });

        if (task.url.endsWith('.zip')) {
          response.pipe(unzipper.Parse())
            .on('entry', (entry) => {
              const filePath = path.join(dirPath, path.basename(entry.path));
              if (entry.type === 'File') {
                entry.pipe(fs.createWriteStream(filePath));
              } else {
                entry.autodrain(); // Skip directories
              }
            })
            .on('finish', () => {
              progressBar.update(totalSize);
              progressBar.stop();
              console.log(`Extraction completed: ${task.to}`);
              resolve(); // Resolve the promise when extraction completes
            })
            .on('error', (err) => {
              console.error(`Error extracting file: ${task.to} - ${err.message}`);
              reject(err); // Reject the promise on error
            });
        } else if (task.url.endsWith('.tgz') || task.url.endsWith('.tar.gz')) {
          const extractStream = tarExtract({ cwd: dirPath, strip: 1 });
          response.pipe(extractStream)
            .on('finish', () => {
              progressBar.update(totalSize);
              progressBar.stop();
              console.log(`Extraction completed: ${task.to}`);
              resolve(); // Resolve the promise when extraction completes
            })
            .on('error', (err) => {
              console.error(`Error extracting file: ${task.to} - ${err.message}`);
              reject(err); // Reject the promise on error
            });
        } else {
          reject(new Error(`Unsupported file type: ${task.url}`));
        }

      } else {
        reject(new Error(`Could not retrieve content-length for ${task.url}`));
      }
    }).on('error', (err) => {
      console.error(`Error downloading file: ${task.url} - ${err.message}`);
      reject(err); // Reject the promise on download error
    });
  });
};

const downloadAndExtractAllFiles = async () => {
  try {
    const downloadPromises = downloadTasks.map(downloadAndExtractFile);
    await Promise.all(downloadPromises);
    multiBar.stop();
    console.log('All downloads and extractions completed.');
  } catch (err) {
    console.error('An error occurred during downloads or extractions:', err);
  }
};

downloadAndExtractAllFiles();
