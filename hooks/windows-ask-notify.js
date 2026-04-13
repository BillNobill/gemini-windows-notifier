#!/usr/bin/env node
const { execFile } = require('child_process');

/**
 * Hook de Alerta para Windows (Perguntas e Permissões)
 * Notifica quando o Gemini CLI está aguardando interação do usuário.
 */

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
        const toolName = data.tool_name;
        const notificationType = data.notification_type; 
        
        let notificationTitle = "Gemini: Decisão Pendente";
        let notificationText = "O Gemini está aguardando sua resposta no terminal.";

        if (toolName === 'ask_user' && data.tool_input && data.tool_input.questions) {
            const firstQuestion = data.tool_input.questions[0].question;
            if (firstQuestion) {
                notificationTitle = "Gemini: Pergunta";
                notificationText = firstQuestion.trim().substring(0, 120);
                if (firstQuestion.length > 120) notificationText += "...";
            }
        } 
        else if (notificationType === 'ToolPermission') {
            notificationTitle = "Gemini: Permissão Necessária";
            notificationText = `O Gemini solicita permissão para executar: ${data.tool_name || 'ferramenta'}`;
        }
        else {
            process.stdout.write(JSON.stringify({ decision: "allow" }));
            return;
        }

        const psScript = `
            [void][Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
            [void][Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime]
            $title = "${notificationTitle.replace(/"/g, '`"')}"
            $text = "${notificationText.replace(/"/g, '`"')}"
            $template = @"
<toast duration="long">
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
