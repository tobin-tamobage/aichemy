# RenderZero Studio Plugin System

## How It Works

### Plugins Folder
```
Documents/RenderZero Studio/Plugins/
```

### Installation
Users double-click a `.nbplugin` file → app opens → auto-installs

### Plugin Types

**Content Packs** — Add options to existing categories (cameras, lighting, lenses, etc.)

**Feature Plugins** (future) — Separate mini-apps that can send data to:
- Person slots (face, hair, body, clothing descriptions)
- Global reference image + instruction
- Lighting settings

---

## Using Plugins in Components

```tsx
import { usePlugins, useMergedOptions } from './contexts/PluginContext';

// Get plugin options merged with built-in
const allCameras = useMergedOptions(CAMERAS, 'camera');
```

---

## Content Pack Manifest Example

```json
{
  "id": "vintage-cameras",
  "name": "Vintage Camera Pack",
  "version": "1.0.0",
  "author": "Community",
  "description": "15 classic film cameras",
  
  "type": "content",
  "extends": "camera",
  
  "options": "options.json",
  "images": "images/"
}
```

### options.json
```json
[
  {
    "value": "Kodak Brownie 1950s",
    "label": "Kodak Brownie (1950s)",
    "image": "kodak-brownie.jpg",
    "promptAddition": "shot on vintage Kodak Brownie camera"
  }
]
```

---

## Feature Plugin Manifest Example

```json
{
  "id": "character-creator",
  "name": "Character Creator",
  "version": "1.0.0",
  "author": "Community",
  "description": "Visual character builder",
  
  "type": "feature",
  "entry": "index.html",
  "window": {
    "width": 900,
    "height": 700,
    "resizable": true
  },
  "integrations": [
    {
      "action": "sendToPersonSlot",
      "label": "Send to Person Slot",
      "description": "Sends character to a person slot"
    }
  ]
}
```

---

## Valid Categories for Content Packs

- `camera`
- `lighting`
- `lens`
- `filmStock`
- `shotType`
- `genre`
- `photographer`
- `movieLook`
- `filter`
- `movementPrompt` — Video movement keywords (e.g. pan, tilt, dolly). The `value` field is used as the `promptKeyword`.

---

## Creating a .nbplugin File

A `.nbplugin` file is just a renamed `.zip` containing:

```
my-plugin.nbplugin (zip)
├── manifest.json
├── options.json
└── images/
    ├── option1.jpg
    └── option2.jpg
```
