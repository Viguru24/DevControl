import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(__dirname, 'trigger_continue.vbs');

console.log("🚀 Autopilot Background Service Started");
console.log("Targeting: Antigravity / DevControl windows");
console.log("Pulse: Every 5 seconds");
console.log("Signals: Alt+Enter, Ctrl+Enter, Enter");

setInterval(() => {
    exec(`cscript //NoLogo "${scriptPath}"`, (error, stdout, stderr) => {
        if (stdout && stdout.trim() !== "Target window not found.") {
            console.log(`[${new Date().toLocaleTimeString()}] ${stdout.trim()}`);
        }
    });
}, 3000); // 3 seconds for Max Speed
