# RenderZero Studio

**Cinematic AI Image Prompt Builder** - > From Nothing

A desktop application for building professional-quality AI image generation prompts with cinematic camera controls, multi-character reference support, and scene variation generation.

## Features

- **Cinematic Prompt Building**: Select shot types, camera bodies, lenses, focal lengths, film stocks, lighting, photographers, and movie looks through visual selectors
- **Multi-Character Elements Tool**: Upload face, outfit, and object references for up to 4 characters, plus scene and global references
- **Scene Variation System**: Generate 4 random-angle variations from a primary render with consistent characters
- **Image Editing (Inpaint)**: Built-in inpaint editor for editing reference images before generation
- **Preset System**: Save/load prompt presets with a bundled preset library
- **Project Files**: Save and load complete projects (`.nbproject`) with all images and settings
- **Plugin System**: Content packs and feature plugins (`.nbplugin` files)
- **Delta Update System**: Apply updates via `.nbupdate` and `.nbprovider` files
- **Expansion Apps**: Framework for mini-apps (e.g., Character Creator) running in separate windows
- **Multi-Provider**: Pluggable API provider system (Gemini, KIE.AI, + user-installed providers)
- **Cross-Platform**: Windows, macOS, and Linux via Electron

## Quick Start

```bash
# Install dependencies
npm install

# Development (web only)
npm run dev

# Development (Electron)
npm run electron:dev

# Build for production
npm run build

# Package Electron app
npm run electron:build
```

## Architecture

### Directory Structure

```
├── App.tsx                 # Main UI component (uses custom hooks)
├── index.tsx               # Entry point with ErrorBoundary
├── types.ts                # All TypeScript interfaces
├── constants.ts            # Visual options (cameras, lenses, etc.)
├── components/
│   ├── ClearableControl.tsx    # Clearable wrapper for form controls
│   ├── ErrorBoundary.tsx       # React error boundary
│   ├── InpaintEditor.tsx       # Canvas-based image editor
│   ├── PresetLibraryModal.tsx  # Preset save/load modal
│   ├── Selector.tsx            # Dropdown selector
│   ├── SettingsModal.tsx       # Dynamic API provider settings
│   ├── Slider.tsx              # Range slider
│   ├── TextInput.tsx           # Text/textarea input
│   └── VisualSelector.tsx      # Image-based option picker
├── hooks/
│   ├── index.ts                # Re-exports all hooks
│   ├── useApiProvider.ts       # API provider selection & key management
│   ├── useElements.ts          # Elements Tool state (characters, scene, images)
│   ├── useGeneration.ts        # Generation logic (single + scene variations)
│   ├── useProjectIO.ts         # Project save/load/clear
│   └── usePromptState.ts       # Prompt building & state management
├── services/
│   ├── expansionManager.ts     # Expansion app lifecycle
│   ├── pluginBridge.ts         # Cross-window plugin communication
│   ├── pluginManager.ts        # Plugin loading & installation
│   ├── promptBuilder.ts        # Converts PromptState → text prompt
│   ├── updateManager.ts        # Delta update system
│   └── providers/
│       ├── types.ts            # IAPIProvider interface
│       ├── registry.ts         # ProviderRegistry singleton
│       ├── gemini.ts           # Google Gemini provider
│       ├── kie-ai.ts           # KIE.AI (Nano Banana Pro) provider
│       └── index.ts            # Provider registration
├── contexts/
│   └── PluginContext.tsx        # React context for plugin system
├── electron/
│   ├── main.cjs                # Electron main process
│   └── preload.cjs             # Context bridge (IPC methods)
└── public/
    ├── images/                 # Visual selector preview images
    └── presets/                # Bundled preset JSON files
```

### State Management

The app uses 5 custom hooks to decompose what was a monolithic component:

| Hook | Responsibility |
|------|---------------|
| `usePromptState` | Prompt text, auto-builder, filter handling, manual edit mode |
| `useApiProvider` | Provider selection, API key storage, key validation |
| `useGeneration` | Image generation, scene variations, loading states |
| `useElements` | Character/scene/global references, file handling, inpaint editor |
| `useProjectIO` | Project save/load/clear operations |

### Provider System

The app uses a **Provider Registry** pattern for API providers. Each provider implements the `IAPIProvider` interface:

```typescript
interface IAPIProvider {
  readonly id: string;
  readonly metadata: ProviderMetadata;
  generate(request: GenerationRequest): Promise<GenerationResponse>;
  edit?(request: EditRequest): Promise<GenerationResponse>;
  validateKey?(apiKey: string): Promise<boolean>;
}
```

Built-in providers:
- **Gemini** (`gemini`): Google Gemini 3 Pro Image Preview via `@google/genai`
- **KIE.AI** (`kie-ai`): Nano Banana Pro via KIE API (requires Electron CORS proxy)

## Adding a New API Provider

### Option 1: Code (for developers)

1. Create `services/providers/my-provider.ts`:

```typescript
import { IAPIProvider, GenerationRequest, GenerationResponse, ProviderMetadata } from './types';

export class MyProvider implements IAPIProvider {
  readonly id = 'my-provider';
  readonly metadata: ProviderMetadata = {
    name: 'My Provider',
    description: 'Description here',
    modelName: 'model-v1',
    capabilities: {
      supportsImageGeneration: true,
      supportsImageEditing: false,
      supportsMultipleReferenceImages: true,
      maxReferenceImages: 4,
    },
  };

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    // Your implementation
    return { imageUrl: 'data:image/png;base64,...' };
  }

  async validateKey(apiKey: string): Promise<boolean> {
    // Validate the API key
    return true;
  }
}
```

2. Register it in `services/providers/index.ts`:

```typescript
import { MyProvider } from './my-provider';
providerRegistry.register(new MyProvider());
```

### Option 2: `.nbprovider` package (for end users)

Create a ZIP file with `.nbprovider` extension containing:

```
manifest.json     # Provider metadata
provider.js       # Provider implementation (ES module)
```

The manifest:
```json
{
  "id": "my-provider",
  "name": "My Provider",
  "version": "1.0.0",
  "type": "provider",
  "modelName": "model-v1"
}
```

Users can double-click the `.nbprovider` file to install it, or drag it onto the app.

## Update System

### Delta Updates (`.nbupdate`)

Instead of downloading the entire app for small changes, you can distribute delta updates as `.nbupdate` files. These are ZIP archives containing:

```
manifest.json     # Update metadata (id, version, description, files)
...               # Payload files (new constants, providers, etc.)
```

Users apply updates by:
- Double-clicking the `.nbupdate` file
- Dragging it onto the app window
- Using Help → Check for Updates

### Full App Updates

For major versions, the app uses `electron-updater` with GitHub Releases for full binary updates. The auto-updater checks for updates on launch and can download/install in the background.

## Expansion Apps

The expansion system allows mini-applications (like a future Character Creator) to run in separate Electron windows while communicating with the main app.

```typescript
// Launch an expansion from the main app
window.electron?.launchExpansion('character-creator', {
  width: 900,
  height: 700,
  title: 'Character Creator',
});

// Send data between windows
window.electron?.sendExpansionMessage('character-creator', {
  type: 'character-data',
  payload: { /* ... */ },
});
```

Expansion apps are placed in `Documents/RenderZero Studio/Expansions/{expansion-id}/index.html`.

## Plugin System

### Content Packs

Add new visual options (cameras, lighting, lenses, etc.) as `.nbplugin` content packs:

```json
{
  "id": "cinematic-lighting",
  "name": "Cinematic Lighting Pack",
  "version": "1.0.0",
  "type": "content",
  "extends": "lighting",
  "options": "options.json",
  "images": "images/"
}
```

### Feature Plugins

Add entirely new UI features as plugins with their own HTML/JS:

```json
{
  "id": "mood-board",
  "name": "Mood Board",
  "version": "1.0.0",
  "type": "feature",
  "entry": "index.html",
  "window": { "width": 800, "height": 600 }
}
```

## Storage

All user data is stored in `Documents/RenderZero Studio/`:

| Folder | Contents |
|--------|----------|
| `Presets/` | User-saved prompt presets (JSON) |
| `Generations/` | Auto-saved generated images (configurable location) |
| `Assets/` | Prepared reference images |
| `Plugins/` | Installed content packs & feature plugins |
| `Providers/` | User-installed API providers |
| `Updates/` | Applied delta updates |
| `Expansions/` | Expansion app files |

## Tech Stack

- **React 19** + TypeScript
- **Vite 5** (bundler)
- **Tailwind CSS 3** (styling)
- **Electron 39** (desktop shell)
- **electron-builder** (packaging)
- **@google/genai** (Gemini API)
- **adm-zip** (plugin/update extraction)
- **lucide-react** (icons)

## License

Proprietary — © 2026 Prompt Geek
