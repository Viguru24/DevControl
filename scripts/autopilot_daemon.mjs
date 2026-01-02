import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(__dirname, 'trigger_continue.vbs');

console.log("🚀 Autopilot Background Service Started");
console.log("Targeting: Antigravity / DevControl windows");
console.log("Pulse: Every 5 seconds");
console.log("Signals: Alt+Enter, Ctrl+Enter, Enter");

const pulse = async () => {
    try {
        const response = await fetch('http://localhost:42424/api/auto-mode');
        const data = await response.json();

        if (data.enabled) {
            // exec returns a promise wrapper to ensure we wait
            await new Promise((resolve) => {
                exec(`cscript //NoLogo "${scriptPath}"`, (error, stdout, stderr) => {
                    if (stdout && stdout.trim() !== "" && !stdout.includes("window not found")) {
                        console.log(`[${new Date().toLocaleTimeString()}] 🚀 ${stdout.trim()}`);
                    }
                    resolve();
                });
            });
        }
    } catch (err) {
        // Server might be down, just wait
    }

    // Schedule next pulse ONLY after this one is done
    setTimeout(pulse, 1000);
};

// Start the loop
pulse();
