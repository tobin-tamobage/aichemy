# RenderZero Studio - Electron Desktop App

A prompt builder application for Google's Nano model with multi-angle shot support, now available as a standalone desktop application.

## Development

### Run the web version
```bash
npm run dev
```

### Run the Electron app in development mode
```bash
npm run electron:dev
```
This will start both the Vite dev server and Electron, with hot-reload enabled.

## Building

### Build for your current platform
```bash
npm run electron:build
```

### Build for specific platforms
```bash
# Windows
npm run electron:build:win

# macOS
npm run electron:build:mac

# Linux
npm run electron:build:linux
```

The packaged app will be in `dist/win-unpacked` (Windows) and the installer will be in `dist/`.

## Distribution

After building, you'll find the installer/executable in the `dist` folder:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` file
- **Linux**: `.AppImage` or `.deb` file

Users can download and install the application just like any other desktop app.

## Notes

- The app icon can be customized by adding `icon.ico` (Windows), `icon.icns` (macOS), or `icon.png` (Linux) to the `public` folder

## Troubleshooting

### macOS: "App is damaged and can't be opened"
If you see an error saying the app is "damaged and can't be opened" or that you should "move it to the Trash", this is a common macOS security warning for apps not signed by an identified developer.

To fix this:

1. Move the app to your **Applications** folder.
2. Open the **Terminal** app (Command + Space, type "Terminal").
3. Paste the following command and press Enter:
   ```bash
   xattr -cr "/Applications/RenderZero Studio.app"
   ```
4. You should now be able to open the app normally.

**Note:** Ensure the path in the command matches where you installed the app. If you didn't move it to Applications, you might need to adjust the path (e.g., to `~/Downloads/RenderZero\ Studio.app`).

- Your API key should be set as an environment variable before running the app
