const { exec } = require('child_process');

function getVoices() {
    const script = `
    Add-Type -AssemblyName System.Speech
    $speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $speaker.GetInstalledVoices() | ForEach-Object {
        [PSCustomObject]@{
            Name = $_.VoiceInfo.Name
            Culture = $_.VoiceInfo.Culture
            Gender = $_.VoiceInfo.Gender
            Age = $_.VoiceInfo.Age
            Description = $_.VoiceInfo.Description
            ID = $_.VoiceInfo.Id
        }
    } | ConvertTo-Json
    `;

    exec(`powershell -Command "${script.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error fetching voices:', error);
            return;
        }
        try {
            const voices = JSON.parse(stdout);
            console.log('--- INSTALLED SYSTEM VOICES ---');
            console.table(voices);
            console.log('\nLouis, look for a "German" or "English (United Kingdom)" voice with a specific name.');
        } catch (e) {
            console.log('Raw Output:', stdout);
        }
    });
}

getVoices();
