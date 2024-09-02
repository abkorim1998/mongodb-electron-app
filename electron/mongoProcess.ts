import { ChildProcess, spawn } from 'node:child_process'
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mongoProcess: ChildProcess | null;

export function startMongoDB() {
    const platform = process.platform; // 'win32', 'darwin', 'linux'
    const mongoPath = path.join(__dirname, '..', 'mongodb', platform, 'mongod.exe');

    const dbPath = path.join(app.getPath('userData'), 'mongodb-data');
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

    const logPath = path.join(dbPath, 'mongo.log');
    if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, '');

    mongoProcess = spawn(mongoPath, [
        '--dbpath', dbPath,
        '--logpath', logPath,
        '--bind_ip', '127.0.0.1',
        '--port', '27017'
    ], {
        detached: true,
        stdio: 'ignore' // Ignore stdout and stderr
    });

    mongoProcess.unref(); // Allow the process to continue running independently

    mongoProcess.on('error', (err) => {
        console.error(`MongoDB failed to start: ${err.message}`);
        throw err;
    });

    console.log('MongoDB started successfully');
}

export function stopMongoDB() {
    if (mongoProcess) {
        console.log('Stopping MongoDB...');
        mongoProcess.kill('SIGINT');
        mongoProcess = null;
    }
}
