import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_ROOT = path.join(__dirname, '..', 'Backups');
const MAX_BACKUPS = 10;

/**
 * Creates a timestamped backup of the project's strategic files.
 */
export function createBackup() {
    if (!fs.existsSync(BACKUP_ROOT)) {
        fs.mkdirSync(BACKUP_ROOT);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(BACKUP_ROOT, `backup_v1_${timestamp}`);
    fs.mkdirSync(backupDir);

    const filesToBackup = [
        'PROJECT_STATUS.md',
        'AGENT_INSTRUCTIONS.md',
        'IMPLEMENTATION_MASTER_PLAN.md',
        'ZERO_TOUCH_PROTOCOL.md',
        '.env',
        'server/projects.json'
    ];

    filesToBackup.forEach(file => {
        const src = path.join(__dirname, '..', file);
        const dest = path.join(backupDir, path.basename(file));

        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
        }
    });

    console.log(`[Backup] Created: ${backupDir}`);
    rotateBackups();
    return { success: true, path: backupDir };
}

/**
 * Lists available backups with metadata.
 */
export function listBackups() {
    if (!fs.existsSync(BACKUP_ROOT)) return [];

    return fs.readdirSync(BACKUP_ROOT)
        .filter(f => fs.statSync(path.join(BACKUP_ROOT, f)).isDirectory())
        .map(name => {
            const fullPath = path.join(BACKUP_ROOT, name);
            const stats = fs.statSync(fullPath);
            return {
                name,
                fullPath,
                createdAt: stats.birthtime,
                size: fs.readdirSync(fullPath).length + " files"
            };
        })
        .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Deletes old backups exceeding the MAX_BACKUPS limit.
 */
function rotateBackups() {
    const backups = listBackups();
    if (backups.length > MAX_BACKUPS) {
        backups.slice(MAX_BACKUPS).forEach(old => {
            console.log(`[Backup] Rotating (Deleting): ${old.name}`);
            fs.rmSync(old.fullPath, { recursive: true, force: true });
        });
    }
}

/**
 * Restores a specific backup.
 */
export function restoreBackup(backupName) {
    const backupDir = path.join(BACKUP_ROOT, backupName);
    if (!fs.existsSync(backupDir)) {
        throw new Error("Backup not found: " + backupName);
    }

    const files = fs.readdirSync(backupDir);
    files.forEach(file => {
        const src = path.join(backupDir, file);
        let dest;

        if (file === 'projects.json') {
            dest = path.join(__dirname, 'projects.json');
        } else {
            dest = path.join(__dirname, '..', file);
        }

        fs.copyFileSync(src, dest);
    });

    console.log(`[Backup] Restored: ${backupName}`);
    return { success: true };
}
