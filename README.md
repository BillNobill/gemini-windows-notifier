# Gemini CLI Windows Notifications

Integration hooks for Gemini CLI providing native Windows Toast notifications for completion events, user interaction requests, and tool permission prompts.

## Overview

This project implements a notification system for the [Gemini CLI](https://github.com/google/gemini-cli) on Windows. It addresses the UX gap in long-running tasks by providing asynchronous alerts when the agent completes an operation or requires user intervention.

## Key Features

- **✅ Completion Alerts**: Native Toast notifications for tasks exceeding a configurable time threshold (default: 5s).
- **❓ Interactive Prompts**: Immediate alerts for `ask_user` tool calls and `ToolPermission` requests.
- **⏱️ Duration Tracking**: Calculates and displays session execution time using millisecond precision for cross-culture compatibility.
- **🪶 Content Sanitization**: Automatically extracts and cleans Markdown from agent responses for concise notification summaries.

## Installation Guide

### Option 1: Automated via Gemini CLI (Recommended)

If you already have Gemini CLI installed, you can ask the agent to handle the setup for you.

1. Clone this repository and enter the directory:
   ```powershell
   git clone https://github.com/BillNobill/gemini-windows-notifier.git
   cd gemini-windows-notifier
   ```
2. Open Gemini CLI in this folder:
   ```powershell
   gemini
   ```
3. Give the following prompt:
   > "Install the windows notification hooks for me by running the install.js script and verifying my settings.json."

**⚠️ Important Lifecycle Note:** The notifications will **not** start in the current active session. You must close the CLI (`/exit`) and start a new session for the hooks to be initialized.

### Option 2: Manual Installation (Terminal)

1. Clone the repository and navigate to the root.
2. Run the installer using Node.js:
   ```powershell
   node install.js
   ```

## Usage & Management

### Global Scope
Once installed, the notifier becomes **Global** for your user. This means it will work in **any folder** where you run the Gemini CLI, not just within this repository.

### Enabling/Disabling Hooks
You can manage the notifications directly from within any Gemini CLI session using native commands:

- **List active hooks**: `/hooks list`
- **Disable a specific hook**: `/hooks disable [hook-name]` (e.g., `windows-notifier`)
- **Enable a hook back**: `/hooks enable [hook-name]`

### Configuration
The hooks are registered in your global `%USERPROFILE%/.gemini/settings.json`. You can manually adjust the `timeout` or `threshold` values there if needed.

## Architecture

The system integrates with the Gemini CLI Hook API across multiple lifecycle events:

- **`BeforeAgent`**: Persists the session start timestamp (ms) to a temporary file in `%TEMP%`.
- **`AfterAgent`**: Calculates elapsed time, sanitizes the response, and triggers the Windows Toast notification via a PowerShell child process.
- **`BeforeTool` & `Notification`**: Intercepts blocking requests (questions or permissions) to alert the user immediately, while intelligently filtering duplicate `ask_user` events.

## Contributing

Technical contributions and bug reports are welcome via Pull Requests. Please ensure any modifications to the notification logic maintain the non-blocking execution of the hooks.

## License

MIT
