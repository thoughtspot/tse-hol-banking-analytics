# Using the Example Prompts

These prompts are meant to be run **in order** (1 → 5) against this project using an AI coding tool. Each file is a self-contained prompt: open it, copy its entire contents, and paste it into your tool.

| File | Purpose |
| --- | --- |
| `1-embed-mcp.md` | Wire the Banksy chat to the ThoughtSpot MCP server |
| `2-create-and-embed-liveboard.md` | Create a liveboard and embed it |
| `3-modify-liveboard.md` | Modify the liveboard |
| `4-embed-spotter-fast.md` | Embed Spotter |
| `5-apply-styles.md` | Apply custom styles |
| `example.md` | A trivial prompt for testing your setup |

## Before you start

1. Open a terminal in the **project root** (not this folder), so the tool can see the whole codebase.
2. Make sure `.env.local` is populated. Never paste secrets into a prompt.
3. Start from a clean git state or a feature branch so you can review and revert changes.
4. Replace placeholders such as `{{DEV_URL}}` with your own values before sending the prompt.
5. Try `example.md` first to confirm your tool can read and edit files.

## Step 1: Copy a prompt to the clipboard

Run these from the project root. Swap in the prompt file you want.

### macOS

```bash
pbcopy < example-prompts/1-embed-mcp.md
```

### Linux

Use whichever clipboard tool you have installed.

```bash
# X11
xclip -selection clipboard < example-prompts/1-embed-mcp.md

# X11 (alternative)
xsel --clipboard --input < example-prompts/1-embed-mcp.md

# Wayland
wl-copy < example-prompts/1-embed-mcp.md
```

Install if missing, for example `sudo apt install xclip` or `sudo apt install wl-clipboard`.

### Windows

```powershell
# PowerShell
Get-Content -Raw example-prompts\1-embed-mcp.md | Set-Clipboard
```

```bat
:: Command Prompt
clip < example-prompts\1-embed-mcp.md
```

Under WSL, use `clip.exe < example-prompts/1-embed-mcp.md`.

You can also open the file in any editor, select all, and copy.

## Step 2: Paste into your tool

### Claude Code (CLI)

```bash
cd /path/to/tse-hol-banking-analytics
claude
```

Paste the prompt at the `>` prompt and press Enter. Review each proposed edit and command before approving it.

Alternatively, skip the clipboard and pass the file directly:

```bash
claude "$(cat example-prompts/1-embed-mcp.md)"
```

### Claude Code in VS Code

Open the project folder, open the Claude Code panel, paste the prompt, and send.

### Other LLM coding tools

The workflow is the same: open the project, paste the prompt, review the changes.

- **Cursor**: open the project, press `Cmd/Ctrl+L` for chat or `Cmd/Ctrl+I` for Agent mode, then paste.
- **GitHub Copilot (VS Code)**: open Copilot Chat, switch to **Agent** mode, then paste.
- **Windsurf**: open Cascade, then paste.
- **Aider**: run `aider` in the project root, then paste. For multi-line input, enter `{` on its own line, paste, and end with `}` on its own line.
- **Gemini CLI / Codex CLI**: run the tool in the project root and paste at its prompt.

Use an agent-capable mode. The prompts expect the tool to read files, edit code, and run local commands, which plain chat mode cannot do.

## Tips

- **Run in order.** Later prompts build on the changes from earlier ones.
- **Review before approving.** Check diffs and commands; don't approve blindly.
- **Commit between prompts** so each step is easy to review or undo. Some prompts say "Don't commit"; follow that, then commit yourself after reviewing.
- **Results vary.** Different models produce different code. If a run goes off track, revert with `git restore .` and try again, or add clarifying detail to the prompt.
- **Keep secrets out.** The prompts reference environment variable names, not values. Keep it that way.
