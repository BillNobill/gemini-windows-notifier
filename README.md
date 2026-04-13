# Gemini CLI Windows Notifications

Integration hooks for Gemini CLI providing native Windows Toast notifications for completion events, user interaction requests, and tool permission prompts.

## Overview

This project implements a notification system for the [Gemini CLI](https://github.com/google/gemini-cli) on Windows. It addresses the UX gap in long-running tasks by providing asynchronous alerts when the agent completes an operation or requires user intervention.

## Key Features

- **✅ Completion Alerts**: Native Toast notifications for tasks exceeding a configurable time threshold (default: 5s).
- **❓ Interactive Prompts**: Immediate alerts for `ask_user` tool calls and `ToolPermission` requests.
- **⏱️ Duration Tracking**: Calculates and displays session execution time.
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

The agent will execute the installer, copy the hooks to your global `.gemini/hooks` folder, and update your configuration automatically.

### Option 2: Manual Installation (Terminal)

1. Clone the repository:
   ```powershell
   git clone https://github.com/BillNobill/gemini-windows-notifier.git
   ```
2. Navigate to the project root:
   ```powershell
   cd gemini-windows-notifier
   ```
3. Run the installer using Node.js:
   ```powershell
   node install.js
   ```

## Architecture

The system integrates with the Gemini CLI Hook API across multiple lifecycle events:

- **`BeforeAgent`**: Persists the session start timestamp to a temporary file in `%TEMP%`.
- **`AfterAgent`**: Calculates elapsed time, sanitizes the response, and triggers the Windows Toast notification via a PowerShell child process.
- **`BeforeTool` & `Notification`**: Intercepts blocking requests (questions or permissions) to alert the user immediately.

## Contributing

Technical contributions and bug reports are welcome via Pull Requests. Please ensure any modifications to the notification logic maintain the non-blocking execution of the hooks.

## License

MIT
