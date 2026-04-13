#!/usr/bin/env node
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Hook de Notificação para Windows (Pós-Agent)
 * Notifica via Windows Toast quando uma tarefa longa é concluída.
 */

const THRESHOLD_SECONDS = 5;

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    try {
        if (!input.trim()) {
            process.stdout.write(JSON.stringify({ decision: "allow" }));
            return;
        }

        const data = JSON.parse(input);
        const sessionId = data.session_id;
        const agentResponse = data.prompt_response;

        let duration = 0;
        if (sessionId) {
            const tempFile = path.join(os.tmpdir(), `gemini-start-${sessionId}.txt`);
            if (fs.existsSync(tempFile)) {
                try {
                    const startTime = parseFloat(fs.readFileSync(tempFile, 'utf8'));
                    const endTime = Date.now() / 1000;
                    duration = endTime - startTime;
                    fs.unlinkSync(tempFile);
                } catch (e) {}
            }
        }

        if (duration < THRESHOLD_SECONDS) {
            process.stdout.write(JSON.stringify({ decision: "allow" }));
            return;
        }

        let notificationText = "Tarefa concluída.";
        if (agentResponse) {
            notificationText = agentResponse.trim()
                .replace(/^#+\s+/gm, '') 
                .replace(/\*\*|\*/g, '')  
                .substring(0, 120);
            if (agentResponse.length > 120) notificationText += "...";
        }

        const notificationTitle = `Gemini: Finalizada (${Math.round(duration)}s)`;

        const psScript = `
            [void][Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
            [void][Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime]
            $title = "${notificationTitle.replace(/"/g, '`"')}"
            $text = "${notificationText.replace(/"/g, '`"')}"
            $template = @"
<toast>
    <visual>
        <binding template="ToastGeneric">
            <text>$title</text>
            <text>$text</text>
        </binding>
    </visual>
</toast>
"@
            $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
            $xml.LoadXml($template)
            $toast = New-Object Windows.UI.Notifications.ToastNotification $xml
            $appId = "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe"
            [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
        `;

        execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript], () => {
            process.stdout.write(JSON.stringify({ decision: "allow" }));
        });

    } catch (e) {
        process.stdout.write(JSON.stringify({ decision: "allow" }));
    }
});
