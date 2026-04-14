# Gemini CLI Windows Notifications

Integration hooks for Gemini CLI providing native Windows Toast notifications for completion events, user interaction requests, and tool permission prompts.

## Overview

This project implements a professional notification system for the [Gemini CLI](https://github.com/google/gemini-cli) on Windows. It addresses the UX gap in long-running tasks by providing asynchronous alerts when the agent completes an operation or requires user intervention.

## Key Features

- **✅ Completion & Failure Alerts**: Native Toast notifications for tasks. Automatically detects execution failures and changes alert sounds/titles accordingly.
- **❓ Interactive Prompts**: Immediate alerts for `ask_user` tool calls and `ToolPermission` requests.
- **🖼️ Professional Branding**: High-quality Gemini CLI logo integration in all notifications.
- **🎵 Native Audio**: Uses Windows native `SMS` notification sound for optimal user experience.
- **⚙️ CLI Configuration**: Adjust settings like the time threshold directly from your terminal.

## Installation Guide

### Option 1: Automated via Gemini CLI (Recommended)

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

### Option 2: Manual Installation (Terminal)

1. Clone the repository and navigate to the root.
2. Run the installer:
   ```powershell
   node install.js
   ```

## Configuration

You can easily adjust the notification settings using the included configuration utility. By default, the system only notifies for tasks exceeding 5 seconds.

To change the notification threshold:
```powershell
node config.js --threshold=10
```
*This will create a backup of your settings and update the hooks to only notify for tasks longer than 10 seconds.*

## Usage & Management

### Global Scope
Once installed, the notifier becomes **Global** for your user. It works in **any folder** where you run the Gemini CLI.

### Enabling/Disabling Hooks
Manage notifications directly within the CLI:
- **List active hooks**: `/hooks list`
- **Disable a hook**: `/hooks disable [hook-name]`
- **Enable a hook**: `/hooks enable [hook-name]`

## Architecture

- **`BeforeAgent`**: Persists start timestamp (ms) to `%TEMP%`.
- **`AfterAgent`**: Handles duration calculation, error detection heuristics, and triggers the Windows Toast via PowerShell.
- **`BeforeTool` & `Notification`**: Intercepts `ask_user` and `ToolPermission` events while preventing duplicate notifications.

## Contributing

Technical contributions and bug reports are welcome via Pull Requests.

## License

MIT
