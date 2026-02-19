# Quick Reference

## Scripts (run from project root)

### 🚀 Deploy

```bash
./scripts/deploy.sh
```

Build locally → Upload → Install deps → Restart

### 📋 Logs

```bash
./scripts/logs.sh
```

View live logs (Ctrl+C to exit)

### 📊 Status

```bash
./scripts/status.sh
```

Check if bot is running, memory usage, uptime

### 🔄 Restart

```bash
./scripts/restart.sh
```

Restart without deploying new code

### ⚡ Update

```bash
./scripts/update.sh
```

Pull latest from git on server → Restart

### 🔐 SSH

```bash
./scripts/ssh.sh
```

Connect to server terminal

### 🛑 Stop/Start

```bash
./scripts/stop.sh
./scripts/start.sh
```

### 📝 Edit .env on Server

```bash
./scripts/edit-env.sh
```

Opens nano to edit .env directly on server

### 📤 Push Local .env to Server

```bash
./scripts/push-env.sh
```

Upload your local .env to server (creates backup first)

## Files

- `server.config` - Server IP & credentials (gitignored)
- `.env` - Bot tokens & config (gitignored)
- `scripts/` - All management scripts

## Tip

On macOS, double-click any `.sh` file in Finder to run it!
