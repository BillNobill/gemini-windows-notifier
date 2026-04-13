# Gemini CLI Windows Notifications

Integration hooks for Gemini CLI providing native Windows Toast notifications for completion events, user interaction requests, and tool permission prompts.

## Overview

This project implements a notification system for the [Gemini CLI](https://github.com/google/gemini-cli) on Windows. It addresses the UX gap in long-running tasks by providing asynchronous alerts when the agent completes an operation or requires user intervention.

## Key Features

- **Completion Alerts**: Native Toast notifications for tasks exceeding a configurable time threshold (default: 5s).
- **Interactive Prompts**: Immediate alerts for `ask_user` tool calls and `ToolPermission` requests.
- **Duration Tracking**: Calculates and displays session execution time.
- **Content Sanitization**: Automatically extracts and cleans Markdown from agent responses for concise notification summaries.

## Architecture

The system integrates with the Gemini CLI Hook API across multiple lifecycle events:

1. **`BeforeAgent`**: Persists the session start timestamp to a temporary file.
2. **`AfterAgent`**: Calculates elapsed time, sanitizes the response, and triggers the Windows Toast notification via PowerShell.
3. **`BeforeTool` / `Notification`**: Intercepts blocking requests (questions or permissions) to alert the user.

## Installation

### Prerequisites

- Windows 10/11
- Node.js installed
- Gemini CLI installed and configured

### Setup

Run the automated installer:

```powershell
node install.js
```

The installer will copy the necessary scripts to your `.gemini/hooks` directory and update your global `settings.json` automatically.

## Contributing

Technical contributions and bug reports are welcome via Pull Requests. Please ensure any modifications to the notification logic maintain the non-blocking execution of the hooks.

## License

MIT
