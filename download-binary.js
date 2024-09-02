import fs from 'fs';
import https from 'https';
import { promisify } from 'util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cliProgress from 'cli-progress';
import unzipper from 'unzipper';
import { x as tarExtract } from 'tar'; // Import the `x` function as `tarExtract`

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Convert fs.mkdir to a promise-based function
const mkdirAsync = promisify(fs.mkdir);

// List of files to download and extract
const downloadTasks = [
  {
    url: 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.12.zip',
    to: 'mongodb/windows',
  },
  {
    url: 'https://fastdl.mongodb.org/osx/mongodb-macos-arm64-7.0.12.tgz',
    to: 'mongodb/mac',
  },
  // Add more download tasks as needed
];

// Create a MultiBar instance to manage multiple progress bars
const multiBar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: ' {bar} | {percentage}% | {value}/{total} Bytes | {task}',
}, cliProgress.Presets.shades_classic);

const downloadAndExtractFile = async (task) => {
  const dirPath = path.join(__dirname, task.to);

  // Ensure the directory exists
  await mkdirAsync(dirPath, { recursive: true });

  try {
    https.get(task.url, (response) => {
      const totalSize = parseInt(response.headers['content-length'] || '0', 10);
      
      if (totalSize > 0) {
        const progressBar = multiBar.create(totalSize, 0, { task: task.to });
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;

          // Update the progress bar with the new downloaded size
          progressBar.update(downloadedSize);
        });

        if (task.url.endsWith('.zip')) {
          response.pipe(unzipper.Extract({ path: dirPath }));
        } else if (task.url.endsWith('.tgz') || task.url.endsWith('.tar.gz')) {
          const extractStream = tarExtract({ cwd: dirPath });
          response.pipe(extractStream);
        }

        response.on('end', () => {
          progressBar.update(totalSize); // Ensure it reaches 100%
          progressBar.stop();
          console.log(`Extraction completed: ${task.to}`);
        });

      } else {
        console.error(`Could not retrieve content-length for ${task.url}`);
      }
    }).on('error', (err) => {
      console.error(`Error downloading file: ${task.url} - ${err.message}`);
    });
  } catch (err) {
    console.error(`Error occurred: ${err}`);
  }
};

const downloadAndExtractAllFiles = async () => {
  const downloadPromises = downloadTasks.map(downloadAndExtractFile);
  await Promise.all(downloadPromises);
  multiBar.stop();
  console.log('All downloads and extractions completed.');
};

downloadAndExtractAllFiles();
