/**
 * Configuration Utility for Gemini CLI Windows Notifier
 * Safely updates the notification threshold in settings.json
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SETTINGS_PATH = path.join(os.homedir(), '.gemini', 'settings.json');
const BACKUP_PATH = SETTINGS_PATH + '.bak';

function log(msg) { console.log(`[CONFIG] ${msg}`); }
function error(msg) { console.error(`[ERROR] ${msg}`); process.exit(1); }

const args = process.argv.slice(2);
const thresholdArg = args.find(a => a.startsWith('--threshold='));

if (!thresholdArg) {
    console.log('Usage: node config.js --threshold=[seconds]');
    console.log('Example: node config.js --threshold=10');
    process.exit(0);
}

const newThreshold = parseInt(thresholdArg.split('=')[1]);
if (isNaN(newThreshold) || newThreshold < 0) {
    error('Invalid threshold value. Please provide a positive number.');
}

async function updateConfig() {
    if (!fs.existsSync(SETTINGS_PATH)) {
        error('settings.json not found. Please run the installer first.');
    }

    log(`Creating backup at ${BACKUP_PATH}...`);
    fs.copyFileSync(SETTINGS_PATH, BACKUP_PATH);

    let settings;
    try {
        const content = fs.readFileSync(SETTINGS_PATH, 'utf8');
        settings = JSON.parse(content);
    } catch (e) {
        error(`Failed to parse settings.json: ${e.message}`);
    }

    if (!settings.hooks || !settings.hooks.AfterAgent) {
        error('Notifier hooks not found in settings.json. Please run the installer first.');
    }

    let updated = false;
    
    // Find our specific hook and update the THRESHOLD_SECONDS variable in the script if it exists,
    // or just pass it as an environment variable or argument.
    // However, the cleanest way without changing the scripts too much is to update the threshold
    // inside the windows-notify.js file itself or passed as an argument.
    
    // Let's update the threshold value directly in the windows-notify.js file for simplicity
    const hooksDir = path.join(os.homedir(), '.gemini', 'hooks');
    const notifyScriptPath = path.join(hooksDir, 'windows-notify.js');

    if (fs.existsSync(notifyScriptPath)) {
        log(`Updating threshold to ${newThreshold}s in windows-notify.js...`);
        let scriptContent = fs.readFileSync(notifyScriptPath, 'utf8');
        const updatedContent = scriptContent.replace(/const THRESHOLD_SECONDS = \d+;/, `const THRESHOLD_SECONDS = ${newThreshold};`);
        
        if (scriptContent !== updatedContent) {
            fs.writeFileSync(notifyScriptPath, updatedContent);
            updated = true;
        } else {
            log('Threshold already set to this value or pattern not found.');
        }
    } else {
        error('Notification script not found in hooks directory.');
    }

    if (updated) {
        log('Configuration updated successfully!');
    } else {
        log('No changes were made.');
    }
}

updateConfig().catch(err => error(err.message));
