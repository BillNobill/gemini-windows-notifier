#!/usr/bin/env node
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

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

        let durationSeconds = 0;
        if (sessionId) {
            const tempFile = path.join(os.tmpdir(), `gemini-start-${sessionId}.txt`);
            if (fs.existsSync(tempFile)) {
                try {
                    const content = fs.readFileSync(tempFile, 'utf8').trim();
                    const startTimeMs = BigInt(content);
                    const endTimeMs = BigInt(Date.now());
                    durationSeconds = Number(endTimeMs - startTimeMs) / 1000;
                    fs.unlinkSync(tempFile);
                } catch (e) {}
            }
        }

        // Notifica apenas se demorar mais que o threshold ou se não houver timer (teste)
        if (durationSeconds > 0 && durationSeconds < THRESHOLD_SECONDS) {
            process.stdout.write(JSON.stringify({ decision: "allow" }));
            return;
        }

        let notificationText = "Tarefa concluída.";
        if (agentResponse) {
            notificationText = agentResponse.trim()
                .replace(/^#+\s+/gm, '') 
                .replace(/\*\*|\*/g, '')  
                .substring(0, 100);
            if (agentResponse.length > 100) notificationText += "...";
        }

        const notificationTitle = `Gemini: Finalizada (${Math.round(durationSeconds)}s)`;

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
            # AppId oficial do PowerShell (mais compatível)
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
