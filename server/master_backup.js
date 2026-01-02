import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates a complete backup of DevControl's data
 */
export function createMasterBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupDir = path.join(__dirname, '..', 'Backups', `master-backup-${timestamp}`);

    // Create backup directory
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const files = [];

    // 1. Projects database
    const projectsFile = path.join(__dirname, 'projects.json');
    if (fs.existsSync(projectsFile)) {
        fs.copyFileSync(projectsFile, path.join(backupDir, 'projects.json'));
        files.push('projects.json');
    }

    // 2. Manager chat histories
    const historyFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('manager_history_'));
    historyFiles.forEach(file => {
        fs.copyFileSync(
            path.join(__dirname, file),
            path.join(backupDir, file)
        );
        files.push(file);
    });

    // 3. Environment variables
    const envFile = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envFile)) {
        fs.copyFileSync(envFile, path.join(backupDir, '.env'));
        files.push('.env');
    }

    // 4. Package.json
    const packageFile = path.join(__dirname, '..', 'package.json');
    if (fs.existsSync(packageFile)) {
        fs.copyFileSync(packageFile, path.join(backupDir, 'package.json'));
        files.push('package.json');
    }

    // Create manifest
    const manifest = {
        timestamp: new Date().toISOString(),
        files: files,
        note: 'DevControl data backup'
    };

    fs.writeFileSync(
        path.join(backupDir, 'MANIFEST.json'),
        JSON.stringify(manifest, null, 2)
    );

    return {
        success: true,
        backupPath: backupDir,
        filesBackedUp: files.length,
        timestamp: timestamp
    };
}

/**
 * Lists all master backups
 */
export function listMasterBackups() {
    const backupsDir = path.join(__dirname, '..', 'Backups');

    if (!fs.existsSync(backupsDir)) {
        return [];
    }

    const backups = fs.readdirSync(backupsDir)
        .filter(name => name.startsWith('master-backup-'))
        .map(name => {
            const backupPath = path.join(backupsDir, name);
            const manifestPath = path.join(backupPath, 'MANIFEST.json');

            let manifest = null;
            try {
                if (fs.existsSync(manifestPath)) {
                    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                }
            } catch (e) {
                console.error(`Error reading manifest for ${name}`, e);
            }

            return {
                name: name,
                path: backupPath,
                created: fs.statSync(backupPath).mtime,
                manifest: manifest
            };
        })
        .sort((a, b) => b.created - a.created);

    return backups;
}

/**
 * Restores from a master backup
 */
export function restoreMasterBackup(backupName) {
    const backupPath = path.join(__dirname, '..', 'Backups', backupName);

    if (!fs.existsSync(backupPath)) {
        throw new Error('Backup not found');
    }

    const manifestPath = path.join(backupPath, 'MANIFEST.json');
    if (!fs.existsSync(manifestPath)) {
        throw new Error('Invalid backup: missing manifest');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Restore each file
    manifest.files.forEach(file => {
        const sourcePath = path.join(backupPath, file);
        let destPath;

        if (file.startsWith('manager_history_') || file === 'projects.json') {
            destPath = path.join(__dirname, file);
        } else if (file === '.env' || file === 'package.json') {
            destPath = path.join(__dirname, '..', file);
        }

        if (fs.existsSync(sourcePath) && destPath) {
            fs.copyFileSync(sourcePath, destPath);
        }
    });

    return {
        success: true,
        filesRestored: manifest.files.length,
        timestamp: manifest.timestamp
    };
}
