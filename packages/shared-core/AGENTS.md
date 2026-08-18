# Agent Instructions — RenderZero Studio Prompt Builder

This file defines rules and context for AI agents (Codex, Copilot, etc.) working in this codebase.

## Project Overview

RenderZero Studio is an Electron + React + TypeScript image generation prompt builder. It supports multiple API providers (Gemini, KIE AI, and user-installed dynamic providers) and a plugin system for extending content categories.

### Key Architecture

- **Renderer**: React + Vite + Tailwind CSS (TypeScript)
- **Main process**: Electron (`electron/main.cjs`, `electron/preload.cjs`)
- **Providers**: `services/providers/` — registry pattern, built-in + dynamic user-installed
- **Plugins**: `services/pluginManager.ts`, `contexts/PluginContext.tsx` — content packs + feature plugins
- **Updates**: `services/updateManager.ts` — delta update tracking
- **Types**: `types.ts` (root) — all shared TypeScript interfaces

### Storage Locations

| Data | Path |
|------|------|
| User providers | `Documents/RenderZero Studio/Providers/<id>/` |
| User plugins | `Documents/RenderZero Studio/Plugins/<id>/` |
| Delta updates | `Documents/RenderZero Studio/Updates/<id>_<version>/` |
| Presets | `Documents/RenderZero Studio/Presets/` |
| Generated images | `Documents/RenderZero Studio/Generations/` |
| Settings | Electron `userData/settings.json` |
| API keys | `localStorage` (renderer) |

---

## Package System Rules

The app has three distributable package types. All are signed ZIP archives verified with HMAC-SHA256 before extraction.

### Rule 1: Never modify bundled source files via a package

Packages only add to user-space directories (`Documents/RenderZero Studio/`). They never overwrite files in the app bundle. The `UpdateFileEntry.action` types (`add`, `replace`, `merge`) refer to files within the user-space Updates directory, not the app source.

### Rule 2: Always sign packages

Every `.nbplugin`, `.nbprovider`, and `.nbupdate` must be signed with `node sign-package.cjs <file>` before distribution. Unsigned or tampered packages are rejected by the app. The signing key is `PACKAGE_SIGNING_KEY` in `electron/main.cjs`.

### Rule 3: Provider packages are config-only

`.nbprovider` packages define API integration via declarative JSON config (`endpoint`, `authScheme`, `requestMapping`, `responseMapping`). No executable JavaScript. The `DynamicProvider` adapter in `services/providers/dynamicProvider.ts` handles all runtime behavior.

### Rule 4: Plugin options are additive

Content packs merge into existing categories via `useMergedOptions()`. You cannot remove or override built-in options — only add new ones. Valid categories: `camera`, `lighting`, `lens`, `filmStock`, `shotType`, `genre`, `photographer`, `movieLook`, `filter`, `movementPrompt`.

### Rule 5: Use unique IDs

Every package must have a globally unique `id`. Conflicts with built-in providers (`gemini`, `kie-ai`) are silently skipped.

### Rule 6: Version bumps for updates

When re-distributing a package, bump the `version` field. The app skips plugins with version ≤ the already installed version.

### Rule 7: Code changes go through the app updater

For actual code changes (bug fixes, new features, refactors), edit the source code directly and ship via `electron-updater` / GitHub Releases. The delta update system (`.nbupdate`) is for content and configuration only, not code patches.

### Rule 8: Test both valid and tampered

When creating a package, always generate a tampered copy to verify the integrity check rejects it. Use `create-test-provider.cjs` as a reference.

---

## Creating Packages

### `.nbprovider` — New API Provider

```
1. Create folder with manifest.json (see types.ts → UserProviderManifest)
2. ZIP contents → rename to .nbprovider
3. Sign: node sign-package.cjs my-provider.nbprovider
4. Distribute to users
```

Manifest fields: `id`, `name`, `version`, `modelName`, `endpoint`, `authScheme`, `httpMethod`, `requestMapping` (promptField, aspectRatioField, staticFields), `responseMapping` (imageField, mimeType), `supportedAspectRatios`, `supportedImageSizes`.

Auth schemes: `bearer`, `x-api-key`, `query`, `none`.

### `.nbplugin` — Content Pack

```
1. Create: manifest.json + options.json + images/
2. ZIP contents → rename to .nbplugin
3. Sign: node sign-package.cjs my-plugin.nbplugin
4. Distribute to users
```

See `PLUGIN_SYSTEM.md` for full manifest and options schema.

### `.nbupdate` — Delta Update

```
1. Create: manifest.json + payload files (presets, configs)
2. ZIP contents → rename to .nbupdate
3. Sign: node sign-package.cjs my-update.nbupdate
4. Distribute to users
```

Update types: `patch`, `provider`, `content`, `expansion`.

---

## Security

- All packages are verified with HMAC-SHA256 in `verifyPackageIntegrity()` (`electron/main.cjs`) before extraction
- The HMAC covers the sorted manifest content (excluding signature fields) + all other file contents in sorted order
- Signing key: `PACKAGE_SIGNING_KEY` constant in `electron/main.cjs` and `sign-package.cjs`
- Dynamic providers never execute user-supplied code — they use declarative config only
- API keys are stored in `localStorage`, never transmitted except to the configured provider endpoint

---

## Dev Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (web only) |
| `npm run electron:dev` | Start Electron app in dev mode |
| `npm run electron:build` | Build distributable Electron app |
| `node sign-package.cjs <file>` | Sign a package for distribution |
| `node create-test-provider.cjs` | Generate test `.nbprovider` packages |

---

## Key Files

| File | Purpose |
|------|---------|
| `electron/main.cjs` | Electron main process, IPC handlers, package verification |
| `electron/preload.cjs` | Preload script, exposed IPC APIs |
| `types.ts` | All shared TypeScript types including `UserProviderManifest`, `IElectronAPI` |
| `services/providers/registry.ts` | Provider registry singleton |
| `services/providers/dynamicProvider.ts` | Config-based provider adapter for user-installed providers |
| `services/providers/index.ts` | Provider registration + `loadDynamicProviders()` |
| `services/pluginManager.ts` | Plugin loading, install, uninstall |
| `services/updateManager.ts` | Delta update tracking and application |
| `hooks/useApiProvider.ts` | Provider selection hook, loads dynamic providers on mount |
| `components/SettingsModal.tsx` | Settings UI, provider dropdown |
| `constants.ts` | All built-in visual options (cameras, lighting, lenses, etc.) |
| `sign-package.cjs` | Package signing utility |
| `PLUGIN_SYSTEM.md` | Plugin system documentation |
