# Arena Recorder

WoW Addon and companion node.js script to automate the recording of individual arena matches with OBS and its Websocket API.

When you enter or exit an arena match, the addon takes a screenshot — the Node.js script detects it and starts or stops OBS recording automatically.

***Note**: Developped for and tested against Wow 5.5.1 (Mop classic).*

## How It Works

```
[Enter arena] → [Addon takes screenshot] → [Node script detects new file] → [OBS starts recording]
[Leave arena] → [Addon takes screenshot] → [Node script detects new file] → [OBS stops recording]
```

| Component             | Role |
|------------           |------|
| WoW Addon             | Detects when you enter or leave an arena using `PLAYER_ENTERING_WORLD` event, and takes a screenshot via `Screenshot()`. |
| Screenshots Folder    | Serves as the "bridge" — new screenshots signal arena start or end. |
| Node.js Script        | Watches the folder with `chokidar` and controls OBS through `obs-websocket-js`. |

Reason I went with the screenshot approach is that as far as I can tell, lua code cannot write to the file system directly. Even with SavedVariables, the serialization / deserialization happens on logout (or possibly on reload ui).

## Notes

* The addon calls `Screenshot()` 5 seconds after entering or exiting an arena to ensure the screen is stable.
* The Node watcher assumes one screenshot toggles the recording:
  * If not recording → start recording
  * If already recording → stop recording
* You can use `/arenarecorder start` and `/arenarecorder end` in-game to test OBS automation.

## Requirements

### WoW Addon

- World of Warcraft 5.5.1 client (or compatible version, check `ArenaRecorder.lua` for API used).

### Node.js Bridge

- Node.js 18 or newer  
- OBS Studio (v28 or newer)
- OBS WebSocket enabled (in OBS > Tools (File Menu) > WebSocket Server Settings)
  - Default port: `4455`
  - Set a password

## WoW Addon Setup

1. Copy or clone the repo content to your WoW addons directory: `World of Warcraft/_classic_/Interface/AddOns/ArenaRecorder/`
2. Ensure both files are inside that folder:

```
ArenaRecorder.toc
ArenaRecorder.lua
```

3. Launch WoW and enable the addon in the AddOns menu.

### Test Commands (in-game)

You can manually simulate arena events using:
```
/arenarecorder start
/arenarecorder end
````

Each command will trigger a screenshot (after a 5s delay) and print a confirmation message in chat.

## Node.js Bridge Setup

1. Navigate to the `node/` folder in `World of Warcraft/Interface/AddOns/ArenaRecorder/`:

```bash
# at the root of your World of Warcraft client
cd Interface/AddOns/ArenaRecorder/node
````

2. Install dependencies:

```bash
npm install
```

3. Copy the example `.env` file and edit it:

```bash
cp .env.example .env
```

### Example `.env`

```dotenv
# OBS websocket server info
OBS_HOST=ws://127.0.0.1:4455
OBS_PASSWORD=your_obs_password_here

# Full path to your WoW Screenshots directory
SCREENSHOT_DIR=C:/Program Files (x86)/World of Warcraft/Screenshots
```

4. Launch OBS and enable WebSocket server (in OBS > Tools (File Menu) > WebSocket Server Settings)

5. Start the script:

```bash
node index.js
```

You should see a log output like:

```
[ArenaRecorder] Trying connection to OBS with ws://127.0.0.1:4455
[ArenaRecorder] Connected to OBS.
[ArenaRecorder] Watching folder ...
```

If not check if OBS is running and the .env configuration.

