/**
 * Automated Installer for Gemini CLI Windows Notifier
 * Detects .gemini directory, copies hooks, and updates settings.json.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const GEMINI_DIR = path.join(os.homedir(), '.gemini');
const HOOKS_DIR = path.join(GEMINI_DIR, 'hooks');
const ASSETS_DIR = path.join(GEMINI_DIR, 'assets');
const SETTINGS_PATH = path.join(GEMINI_DIR, 'settings.json');

const SCRIPTS_TO_COPY = [
    'mark-start.ps1',
    'windows-notify.js',
    'windows-ask-notify.js'
];

function log(msg) { console.log(`[INSTALLER] ${msg}`); }
function error(msg) { console.error(`[ERROR] ${msg}`); process.exit(1); }

async function setup() {
    log('Starting Gemini CLI Windows Notifier installation...');

    // 1. Verify .gemini directory
    if (!fs.existsSync(GEMINI_DIR)) {
        error('.gemini directory not found in user home. Is Gemini CLI installed?');
    }

    // 2. Create directories if missing
    if (!fs.existsSync(HOOKS_DIR)) {
        log('Creating hooks directory...');
        fs.mkdirSync(HOOKS_DIR, { recursive: true });
    }
    if (!fs.existsSync(ASSETS_DIR)) {
        log('Creating assets directory...');
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    // 3. Copy scripts
    log('Copying notification scripts...');
    for (const file of SCRIPTS_TO_COPY) {
        const src = path.join(__dirname, 'hooks', file);
        const dest = path.join(HOOKS_DIR, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
        } else {
            log(`Warning: ${file} not found in current directory. Skipping.`);
        }
    }

    // 3.1 Copy assets
    log('Copying notification assets...');
    const srcAssetsDir = path.join(__dirname, 'assets');
    if (fs.existsSync(srcAssetsDir)) {
        const assetFiles = fs.readdirSync(srcAssetsDir);
        for (const file of assetFiles) {
            fs.copyFileSync(path.join(srcAssetsDir, file), path.join(ASSETS_DIR, file));
        }
    }

    // 4. Update settings.json
    if (!fs.existsSync(SETTINGS_PATH)) {
        log('settings.json not found. Creating a new one...');
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify({ hooks: {} }, null, 2));
    }

    let settings;
    try {
        settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    } catch (e) {
        error(`Failed to parse settings.json: ${e.message}`);
    }

    if (!settings.hooks) settings.hooks = {};

    // Helper to add a hook if it doesn't exist (by name or command match)
    const addHook = (event, name, type, command) => {
        if (!settings.hooks[event]) settings.hooks[event] = [];
        
        // Flatten hooks to check for existence
        const allHooks = settings.hooks[event].flatMap(h => h.hooks || []);
        const exists = allHooks.some(h => h.name === name || h.command.includes(command.replace(/\\/g, '/')));

        if (!exists) {
            log(`Adding ${name} hook to ${event}...`);
            // Standard structure for Gemini hooks
            const hookEntry = {
                hooks: [{
                    name,
                    type,
                    command,
                    timeout: 5000
                }]
            };

            // BeforeTool and AfterTool often use matchers
            if (event === 'BeforeTool' && name === 'ask-notifier') {
                hookEntry.matcher = 'ask_user';
            } else if (event === 'BeforeAgent' || event === 'AfterAgent') {
                hookEntry.matcher = '.*';
            }

            settings.hooks[event].push(hookEntry);
            return true;
        }
        return false;
    };

    const homeSub = os.homedir().replace(/\\/g, '/');
    const updated = [
        addHook('BeforeAgent', 'start-timer', 'command', `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${homeSub}/.gemini/hooks/mark-start.ps1"`),
        addHook('AfterAgent', 'windows-notifier', 'command', `node "${homeSub}/.gemini/hooks/windows-notify.js"`),
        addHook('BeforeTool', 'ask-notifier', 'command', `node "${homeSub}/.gemini/hooks/windows-ask-notify.js"`),
        addHook('Notification', 'permission-notifier', 'command', `node "${homeSub}/.gemini/hooks/windows-ask-notify.js"`)
    ].some(v => v);

    if (updated) {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
        log('settings.json updated successfully.');
    } else {
        log('No changes needed in settings.json (hooks already present).');
    }

    log('Installation complete! Enjoy your notifications.');
}

setup().catch(err => error(err.message));
