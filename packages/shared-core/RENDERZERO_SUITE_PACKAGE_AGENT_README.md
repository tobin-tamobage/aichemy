# RenderZero Suite Package Agent README

This guide is for agents creating provider, model, ComfyUI, content, or suite update packages for RenderZero Studio and the wider RenderZero Suite.

The suite refactor uses signed ZIP packages that install into the shared RenderZero Suite folder. Packages must never modify bundled app source files. Full source/code changes still ship through normal app releases.

## Package Types

| Extension | Purpose | Install Target |
| --- | --- | --- |
| `.nbprovider` | New API provider or provider plus model bundle | `Providers/<id>/` |
| `.nbmodel` | Declarative provider/model catalog package | `Packages/Models/<id>_<version>/` |
| `.nbcomfy` | ComfyUI workflow/model pack | `ComfyUI/Packs/<id>_<version>/` |
| `.nbplugin` | Content or feature plugin | `Plugins/<id>/` |
| `.nbupdate` | Shared content/config update | `Packages/Updates/<id>_<version>/` |

All packages are ZIP archives with `manifest.json` at the root. The app verifies HMAC-SHA256 signatures before extraction and records installed packages in `Packages/installed.json`.

## Agent Rules

1. Do not put executable JavaScript in provider packages.
2. Do not overwrite app bundle/source files from a package.
3. Use globally unique package IDs.
4. Never reuse built-in provider IDs: `gemini`, `kie-ai`, `fal-ai`, `wavespeed`, `runninghub`, `comfyui`, `hedra`.
5. Bump `version` every time a package is redistributed.
6. Sign every package with `node sign-package.cjs <file>`.
7. Create a tampered copy during QA and confirm the app rejects it.
8. Prefer declarative request/response mappings for REST, queued jobs, polling, auth, pricing, and model capability metadata.

## Create A Package

Create a folder:

```text
my-provider/
  manifest.json
```

Compress the folder contents, not the containing folder:

```powershell
Compress-Archive -Path .\my-provider\* -DestinationPath .\my-provider.zip
Rename-Item .\my-provider.zip my-provider.nbprovider
node sign-package.cjs .\my-provider.nbprovider
```

The signing tool supports:

```text
.nbplugin
.nbprovider
.nbupdate
.nbmodel
.nbcomfy
```

## Install A Package

Install by opening/double-clicking the signed package file with RenderZero installed, or by importing it through the app file association. The Electron package handler verifies the signature, stages extraction, applies semver skip rules, then installs into the selected shared RenderZero Suite folder.

If a package with the same ID is already installed at the same or newer version, the app skips it.

## Simple Image Provider Manifest

```json
{
  "id": "example-image-api",
  "name": "Example Image API",
  "version": "1.0.0",
  "author": "RenderZero",
  "description": "Example declarative image provider",
  "modelName": "example-v1",
  "endpoint": "https://api.example.com/v1/images",
  "authScheme": "bearer",
  "httpMethod": "POST",
  "requestMapping": {
    "promptField": "prompt",
    "aspectRatioField": "aspect_ratio",
    "staticFields": {
      "model": "example-v1"
    }
  },
  "responseMapping": {
    "imageField": "data.image_base64",
    "mimeType": "image/png"
  },
  "supportedAspectRatios": ["1:1", "16:9", "9:16"],
  "supportedImageSizes": ["1K", "2K", "4K"],
  "pricing": {
    "standard": 0.05,
    "fourK": 0.12
  }
}
```

## Provider With Multiple Models

Use `models` when the provider exposes multiple selectable models. Image models become image model capabilities. Video models become dynamic video adapter models when `modality` is `video` or `both`.

```json
{
  "id": "example-provider",
  "name": "Example Provider",
  "version": "1.0.0",
  "modelName": "example",
  "endpoint": "https://api.example.com/v1/generate",
  "authScheme": "x-api-key",
  "authHeaderName": "X-API-Key",
  "httpMethod": "POST",
  "requestMapping": {
    "promptField": "input.prompt"
  },
  "fieldMappings": [
    { "field": "input.model", "source": "providerModelId" },
    { "field": "input.aspect_ratio", "source": "aspectRatio" },
    { "field": "input.size", "source": "imageSize" }
  ],
  "responseMapping": {
    "imageField": "output.image_base64",
    "mimeType": "image/png"
  },
  "models": [
    {
      "id": "example-image-standard",
      "name": "Example Image Standard",
      "providerModelId": "image-standard",
      "modality": "image",
      "supportedAspectRatios": ["1:1", "16:9", "9:16"],
      "supportedImageSizes": ["1K", "2K"]
    },
    {
      "id": "example-image-pro",
      "name": "Example Image Pro",
      "providerModelId": "image-pro",
      "modality": "image",
      "supportedAspectRatios": ["1:1", "16:9", "9:16"],
      "supportedImageSizes": ["1K", "2K", "4K"]
    }
  ]
}
```

## Queued Video Provider Manifest

Use `jobMapping` for providers that submit a job and poll for completion.

```json
{
  "id": "example-video-provider",
  "name": "Example Video Provider",
  "version": "1.0.0",
  "modelName": "example-video",
  "endpoint": "https://api.example.com/v1/jobs",
  "authScheme": "bearer",
  "httpMethod": "POST",
  "requestMapping": {
    "promptField": "input.prompt"
  },
  "fieldMappings": [
    { "field": "input.model", "source": "providerModelId" },
    { "field": "input.duration", "source": "duration", "defaultValue": "5" },
    { "field": "input.aspect_ratio", "source": "aspectRatio" },
    { "field": "input.start_image", "source": "startImageUrl" },
    { "field": "input.seed", "source": "seed" }
  ],
  "jobMapping": {
    "jobIdField": "id",
    "statusEndpoint": "https://api.example.com/v1/jobs/{jobId}",
    "statusMethod": "GET",
    "statusField": "status",
    "successStatuses": ["completed"],
    "failureStatuses": ["failed", "error"],
    "pollIntervalMs": 1500,
    "timeoutMs": 600000,
    "errorField": "error.message"
  },
  "responseMapping": {
    "imageField": "unused",
    "videoUrlField": "output.video_url"
  },
  "models": [
    {
      "id": "example-video-fast",
      "name": "Example Video Fast",
      "providerModelId": "video-fast",
      "modality": "video",
      "tasks": ["imageToVideo", "textToVideo"],
      "supportedAspectRatios": ["16:9", "9:16", "1:1"],
      "supportedDurations": ["5", "10"],
      "inputSchema": {
        "requiresPrompt": true,
        "requiresStartImage": false,
        "supportsStartImage": true,
        "supportsSeed": true,
        "supportsMovementPromptSelector": true
      }
    }
  ]
}
```

## Dynamic Mapping Extensions

Provider packages can describe provider-specific envelopes without app code changes:

- Use model or task `endpoint` to override the provider-level submit URL.
- Use `fieldMappings` or model `requestMapping.fields` with either `source` for one value or `sources` for ordered arrays such as `image_urls`.
- Use `valueType` (`string`, `number`, `boolean`) when a provider expects primitive JSON types instead of UI strings.
- Use `mediaKind` (`image`, `video`, `audio`) to resolve local data URLs through manifest-declared `assetUploads`; hosted HTTP(S) URLs pass through.
- Response paths support array indexes (`results[0]`) and simple filters (`data.files[file_type=video].file_url`).

Generic upload mappings can be declared once:

```json
{
  "assetUploads": {
    "image": {
      "endpoint": "https://files-api.example.com/upload/base64",
      "contentType": "json-base64",
      "dataField": "base64_data",
      "responseField": "data.file_url"
    },
    "video": {
      "endpoint": "https://api.example.com/files/upload",
      "contentType": "multipart",
      "fileField": "file",
      "responseField": "data.file_url"
    }
  }
}
```

## Model Pack For Existing Credentials

To add models that reuse another provider's saved API key, set `credentialProviderId`.

```json
{
  "id": "fal-ai-extra-models",
  "name": "Fal.ai Extra Models",
  "version": "1.0.0",
  "credentialProviderId": "fal-ai",
  "modelName": "fal-extra",
  "endpoint": "https://fal.run/example/endpoint",
  "authScheme": "bearer",
  "httpMethod": "POST",
  "requestMapping": {
    "promptField": "prompt"
  },
  "responseMapping": {
    "imageField": "images[0].base64",
    "mimeType": "image/png"
  },
  "models": [
    {
      "id": "fal-extra-image",
      "name": "Fal Extra Image",
      "providerModelId": "fal-extra-image",
      "modality": "image"
    }
  ]
}
```

Note: these packages currently appear as their own provider entry, but they can reuse the built-in provider credential through `credentialProviderId`.

## ComfyUI Pack Manifest

`.nbcomfy` packages can include workflow JSON files and model/custom-node metadata. Workflow files under `workflows/image/` and `workflows/video/` are merged into the shared ComfyUI config.

```text
my-comfy-pack/
  manifest.json
  workflows/
    image/
      flux-image.json
    video/
      wan-video.json
```

```json
{
  "id": "renderzero-comfy-flux-pack",
  "name": "RenderZero Comfy Flux Pack",
  "version": "1.0.0",
  "type": "comfyui-pack",
  "description": "ComfyUI workflows and model metadata for RenderZero.",
  "comfyUi": {
    "models": [
      {
        "id": "flux-model",
        "name": "Flux Model",
        "repo_id": "example/flux",
        "filename": "flux.safetensors",
        "source_path": "flux.safetensors",
        "type": "checkpoint",
        "target_subfolder": "models/diffusion_models",
        "gated": false,
        "optional": false,
        "sha256": "",
        "size_bytes": 0
      }
    ],
    "custom_nodes": []
  }
}
```

## Tamper Test

After signing, make a tampered copy and confirm installation fails.

```powershell
Copy-Item .\my-provider.nbprovider .\my-provider-tampered.nbprovider
# Open the ZIP and change any byte/file/manifest value, then try installing it.
```

Expected result: the app rejects it with a security check failure.

## Agent QA Checklist

- Manifest has `id`, `name`, and bumped `version`.
- Package ID is not a built-in provider ID.
- ZIP root contains `manifest.json`.
- Package is signed with `node sign-package.cjs <file>`.
- Tampered copy is rejected.
- Same or older package version is skipped.
- Newer package version replaces the old package.
- Provider appears in Settings after install/restart or provider refresh.
- Image/video generation extracts the expected response field.
- Queued APIs correctly handle success, failure, timeout, and provider error messages.
- ComfyUI workflow packs import into shared ComfyUI config when placed under `workflows/image/` or `workflows/video/`.
