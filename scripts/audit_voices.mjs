import { exec } from 'child_process';

function getVoices() {
    // PowerShell script to get speech synthesis voices
    const psCommand = `Add-Type -AssemblyName System.Speech; $speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speaker.GetInstalledVoices() | ForEach-Object { [PSCustomObject]@{ Name=$_.VoiceInfo.Name; Culture=$_.VoiceInfo.Culture; ID=$_.VoiceInfo.Id } } | ConvertTo-Json`;

    exec(`powershell -Command "${psCommand}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error:', error);
            return;
        }
        try {
            const voices = JSON.parse(stdout);
            console.log('\n--- INSTALLED SYSTEM VOICES ---');
            if (Array.isArray(voices)) {
                voices.forEach((v, i) => {
                    console.log(`[${i}] ${v.Name} (${v.Culture})`);
                    console.log(`    ID: ${v.ID}\n`);
                });
            } else {
                console.log(`[0] ${voices.Name} (${voices.Culture})`);
                console.log(`    ID: ${voices.ID}\n`);
            }
            console.log('-------------------------------\n');
        } catch (e) {
            console.log('Raw output:', stdout);
        }
    });
}

getVoices();
