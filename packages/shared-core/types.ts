export interface PromptState {
  subjectAction: string;
  environment: string;
  shotType: string;
  viewingDirection: string;
  lighting: string;
  mood: string;
  camera: string;
  focalLength: string;
  lens: string;
  fStop: string;
  filmStock: string;
  genre: string;
  westernAnimation: string;
  animeGenre: string;
  animeShowStyle: string;
  photographer: string;
  movieLook: string;
  filter: string[];
  aspectRatio: string;
  imageSize: string;
  imageQuality?: 'low' | 'medium' | 'high';
  grokQualityMode?: boolean;
  falRecraftColors?: string;
  temperature: number;
  showNewAnglePrompt?: boolean;
  candidShot?: boolean;
  noText?: boolean;
}

export const createEmptyPromptState = (): PromptState => ({
  subjectAction: '',
  environment: '',
  shotType: '',
  viewingDirection: '',
  lighting: '',
  mood: '',
  camera: '',
  focalLength: '',
  lens: '',
  fStop: '',
  filmStock: '',
  genre: '',
  westernAnimation: '',
  animeGenre: '',
  animeShowStyle: '',
  photographer: '',
  movieLook: '',
  filter: [],
  aspectRatio: '16:9',
  imageSize: '1K',
  imageQuality: 'high',
  grokQualityMode: false,
  falRecraftColors: '',
  temperature: 1.0,
  showNewAnglePrompt: false,
  candidShot: false,
  noText: false,
});

export const normalizePromptState = (
  state?: Partial<PromptState> | null,
): PromptState => {
  const base = createEmptyPromptState();
  const imageQuality = state?.imageQuality;

  return {
    subjectAction: typeof state?.subjectAction === 'string' ? state.subjectAction : base.subjectAction,
    environment: typeof state?.environment === 'string' ? state.environment : base.environment,
    shotType: typeof state?.shotType === 'string' ? state.shotType : base.shotType,
    viewingDirection: typeof state?.viewingDirection === 'string' ? state.viewingDirection : base.viewingDirection,
    lighting: typeof state?.lighting === 'string' ? state.lighting : base.lighting,
    mood: typeof state?.mood === 'string' ? state.mood : base.mood,
    camera: typeof state?.camera === 'string' ? state.camera : base.camera,
    focalLength: typeof state?.focalLength === 'string' ? state.focalLength : base.focalLength,
    lens: typeof state?.lens === 'string' ? state.lens : base.lens,
    fStop: typeof state?.fStop === 'string' ? state.fStop : base.fStop,
    filmStock: typeof state?.filmStock === 'string' ? state.filmStock : base.filmStock,
    genre: typeof state?.genre === 'string' ? state.genre : base.genre,
    westernAnimation: typeof state?.westernAnimation === 'string' ? state.westernAnimation : base.westernAnimation,
    animeGenre: typeof state?.animeGenre === 'string' ? state.animeGenre : base.animeGenre,
    animeShowStyle: typeof state?.animeShowStyle === 'string' ? state.animeShowStyle : base.animeShowStyle,
    photographer: typeof state?.photographer === 'string' ? state.photographer : base.photographer,
    movieLook: typeof state?.movieLook === 'string' ? state.movieLook : base.movieLook,
    filter: Array.isArray(state?.filter)
      ? state.filter.filter((value): value is string => typeof value === 'string')
      : base.filter,
    aspectRatio: typeof state?.aspectRatio === 'string' ? state.aspectRatio : base.aspectRatio,
    imageSize: typeof state?.imageSize === 'string' ? state.imageSize : base.imageSize,
    imageQuality: imageQuality === 'low' || imageQuality === 'medium' || imageQuality === 'high'
      ? imageQuality
      : base.imageQuality,
    grokQualityMode: typeof state?.grokQualityMode === 'boolean' ? state.grokQualityMode : base.grokQualityMode,
    falRecraftColors: typeof state?.falRecraftColors === 'string' ? state.falRecraftColors : base.falRecraftColors,
    temperature: typeof state?.temperature === 'number' ? state.temperature : base.temperature,
    showNewAnglePrompt: typeof state?.showNewAnglePrompt === 'boolean' ? state.showNewAnglePrompt : base.showNewAnglePrompt,
    candidShot: typeof state?.candidShot === 'boolean' ? state.candidShot : base.candidShot,
    noText: typeof state?.noText === 'boolean' ? state.noText : base.noText,
  };
};

export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";

export interface SelectionCategory {
  title: string;
  items: string[];
}

export interface VisualOption {
  label: string;
  value: string;
  image: string;
}

export interface AnimationStyleOption extends VisualOption {
  prePrompt: string;
  postPrompt: string;
}

// --- Elements Tool (Visual Reference System) ---
export type ElementId = 'character' | 'outfit' | 'object' | 'scene' | 'imageInput' | 'anonymousReference';

export interface ElementDefinition {
  id: ElementId;
  label: string;
  promptLabel: string;
}

export interface ElementState extends ElementDefinition {
  previewDataUrl: string | null; // e.g. data:image/jpeg;base64,...
  base64Data: string | null; // raw base64 only (Gemini inlineData.data)
  mimeType: string | null; // e.g. image/jpeg
  sourcePrompt?: string | null;
  originalDataUrl?: string | null; // Unedited source image before inpainting
  instanceId?: string | null; // Stable key for dynamic element arrays
}

// Category for KIE API image prioritization (8 image limit)
// Priority order: global > face > scene > outfit > object
export type ReferenceImageCategory = 'global' | 'face' | 'scene' | 'outfit' | 'object' | 'anonymous';

export interface InlineReferenceImage {
  mimeType: string;
  data: string; // raw base64
  category?: ReferenceImageCategory; // Used by KIE API for prioritization
}

export interface ReferenceImageSlots {
  character1Face?: InlineReferenceImage;
  character1Outfit?: InlineReferenceImage;
  character1Object?: InlineReferenceImage;
  globalReference?: InlineReferenceImage;
}

export type ElementInputMode = 'single' | 'stitch';
export type FaceInputMode = ElementInputMode;

export interface CharacterData {
  id: string;
  label: string;
  face: ElementState;
  outfit: ElementState;
  object: ElementState;
  faceInputMode?: FaceInputMode; // Optional for backward compatibility with older saves
  outfitInputMode?: ElementInputMode; // Optional for backward compatibility with older saves
  objectInputMode?: ElementInputMode; // Optional for backward compatibility with older saves
}

export interface CharacterTraitFacet {
  id: string;
  axis: string;
  label: string;
  dialogueCue?: string;
  actionCue?: string;
}

export interface CharacterVoiceProfile {
  accent?: string;
  dialogueStyle?: string;
  speechPattern?: string;
  delivery?: string;
}

export interface CharacterPromptProfile {
  autoIncludeInVideoPrompts?: boolean;
  preferredPromptClause?: string;
}

export interface CharacterAssetBundle {
  folder?: string;
  facePath?: string;
  outfitPath?: string;
  objectPath?: string;
  frontalPath?: string;
  referencePaths?: string[];
}

export interface CharacterProfile {
  role?: string;
  tagline?: string;
  summary?: string;
  attitude?: string;
  traits?: string[];
  traitFacets?: CharacterTraitFacet[];
  voice?: CharacterVoiceProfile;
  promptProfile?: CharacterPromptProfile;
}

export interface SavedCharacter {
  id: string;
  name: string;
  timestamp: number;
  data: CharacterData;
  kind?: 'character';
  version?: string;
  profile?: CharacterProfile;
  assets?: CharacterAssetBundle;
  sourceApp?: string;
  filename?: string;
}

export interface SavedKlingElement {
  id: string;
  name: string;
  timestamp: number;
  kind: 'kling-element';
  data: {
    type: 'image';
    frontalImageUrl: string | null;
    referenceImageUrls: [string | null, string | null, string | null];
  };
  filename?: string;
}

/** Draft shape for a Kling V3 image/video element (used by the element library and video modes) */
export interface KlingV3ElementDraft {
  type: 'image' | 'video';
  frontalImageUrl: string | null;
  referenceImageUrls: [string | null, string | null, string | null];
  videoUrl: string | null;
}

export type SavedVideoTaskType =
  | 'multiModalVideo'
  | 'imageToVideo'
  | 'audioDrivenVideo'
  | 'videoMotionReference'
  | 'startEndFrame'
  | 'textToVideo';

export interface SavedVideoProjectShot {
  prompt: string;
  duration: string;
}

export interface GuidedVideoPromptState {
  subject: string;
  environment: string;
  action: string;
  camera: string;
  stylePrefix: string;
  style: string;
  soundFx: string;
  constraints: string;
}

export interface SavedVideoProjectState {
  selectedTask: SavedVideoTaskType | null;
  selectedModelId: string;
  prompt: string;
  guidedPrompt: GuidedVideoPromptState;
  directorMode: boolean;
  multiPromptShots: SavedVideoProjectShot[];
  useEndFrame: boolean;
  startFrameOverride: string | null;
  startFrameDismissed: boolean;
  endFrameImage: string | null;
  referenceImages: Array<string | null>;
  klingV3Elements: KlingV3ElementDraft[];
}

const createEmptyKlingV3ElementDraft = (type: 'image' | 'video' = 'image'): KlingV3ElementDraft => ({
  type,
  frontalImageUrl: null,
  referenceImageUrls: [null, null, null],
  videoUrl: null,
});

export const createEmptyGuidedVideoPromptState = (): GuidedVideoPromptState => ({
  subject: '',
  environment: '',
  action: '',
  camera: '',
  stylePrefix: '',
  style: '',
  soundFx: '',
  constraints: '',
});

export const normalizeGuidedVideoPromptState = (
  state?: Partial<GuidedVideoPromptState> | null,
): GuidedVideoPromptState => {
  const base = createEmptyGuidedVideoPromptState();
  return {
    subject: typeof state?.subject === 'string' ? state.subject : base.subject,
    environment: typeof state?.environment === 'string' ? state.environment : base.environment,
    action: typeof state?.action === 'string' ? state.action : base.action,
    camera: typeof state?.camera === 'string' ? state.camera : base.camera,
    stylePrefix: typeof state?.stylePrefix === 'string' ? state.stylePrefix : base.stylePrefix,
    style: typeof state?.style === 'string' ? state.style : base.style,
    soundFx: typeof state?.soundFx === 'string' ? state.soundFx : base.soundFx,
    constraints: typeof state?.constraints === 'string' ? state.constraints : base.constraints,
  };
};

export const createEmptySavedVideoProjectState = (): SavedVideoProjectState => ({
  selectedTask: null,
  selectedModelId: '',
  prompt: '',
  guidedPrompt: createEmptyGuidedVideoPromptState(),
  directorMode: false,
  multiPromptShots: [{ prompt: '', duration: '5' }],
  useEndFrame: false,
  startFrameOverride: null,
  startFrameDismissed: false,
  endFrameImage: null,
  referenceImages: [null, null, null],
  klingV3Elements: [createEmptyKlingV3ElementDraft()],
});

export const normalizeSavedVideoProjectState = (
  state?: Partial<SavedVideoProjectState> | null,
): SavedVideoProjectState => {
  const base = createEmptySavedVideoProjectState();
  const allowedTasks: SavedVideoTaskType[] = [
    'multiModalVideo',
    'imageToVideo',
    'audioDrivenVideo',
    'videoMotionReference',
    'startEndFrame',
    'textToVideo',
  ];
  const selectedTask = allowedTasks.includes(state?.selectedTask as SavedVideoTaskType)
    ? state!.selectedTask as SavedVideoTaskType
    : null;
  const guidedPrompt = normalizeGuidedVideoPromptState(state?.guidedPrompt);
  const multiPromptShots = Array.isArray(state?.multiPromptShots) && state!.multiPromptShots.length > 0
    ? state!.multiPromptShots.map((shot) => ({
      prompt: typeof shot?.prompt === 'string' ? shot.prompt : '',
      duration: typeof shot?.duration === 'string' && shot.duration.trim() ? shot.duration : '5',
    }))
    : base.multiPromptShots;
  const referenceImages = Array.isArray(state?.referenceImages) && state!.referenceImages.length > 0
    ? state!.referenceImages.map((image) => typeof image === 'string' ? image : null)
    : base.referenceImages;
  const klingV3Elements: KlingV3ElementDraft[] = Array.isArray(state?.klingV3Elements) && state!.klingV3Elements.length > 0
    ? state!.klingV3Elements.map((element): KlingV3ElementDraft => ({
      type: element?.type === 'video' ? 'video' : 'image',
      frontalImageUrl: typeof element?.frontalImageUrl === 'string' ? element.frontalImageUrl : null,
      referenceImageUrls: [
        typeof element?.referenceImageUrls?.[0] === 'string' ? element.referenceImageUrls[0] : null,
        typeof element?.referenceImageUrls?.[1] === 'string' ? element.referenceImageUrls[1] : null,
        typeof element?.referenceImageUrls?.[2] === 'string' ? element.referenceImageUrls[2] : null,
      ] as [string | null, string | null, string | null],
      videoUrl: typeof element?.videoUrl === 'string' ? element.videoUrl : null,
    }))
    : base.klingV3Elements;

  return {
    selectedTask,
    selectedModelId: selectedTask && typeof state?.selectedModelId === 'string' ? state.selectedModelId : '',
    prompt: typeof state?.prompt === 'string' ? state.prompt : '',
    guidedPrompt,
    directorMode: !!state?.directorMode,
    multiPromptShots,
    useEndFrame: !!state?.useEndFrame,
    startFrameOverride: typeof state?.startFrameOverride === 'string' ? state.startFrameOverride : null,
    startFrameDismissed: !!state?.startFrameDismissed,
    endFrameImage: typeof state?.endFrameImage === 'string' ? state.endFrameImage : null,
    referenceImages,
    klingV3Elements,
  };
};

export interface Preset {
  id: string;
  name: string;
  timestamp: number;
  data: Omit<PromptState, 'subjectAction' | 'environment'>;
  filename?: string;
  type?: 'user' | 'bundled';
}

export interface FailedScenePrompt {
  variationIndex: number;
  prompt: string;
  error: string;
}

/** Stable metadata recorded alongside an image or video generation. */
export interface GenerationOutputMetadata {
  providerId?: string | null;
  providerName?: string | null;
  modelId?: string | null;
  modelName?: string | null;
  seed?: number | null;
}

export interface SceneHistoryEntry {
  images: string[];
  prompts: string[];
  /** Metadata for each successful image in `images`, in the same order. */
  generationMetadata?: GenerationOutputMetadata[];
  variationIndices?: number[];
  failedPrompts?: FailedScenePrompt[];
  warning?: string;
  warningDismissed?: boolean;
}

export interface ProjectFile {
  id: string;
  name: string;
  version: string; // Format version for migration support
  timestamp: number;
  promptState: PromptState;
  characters: CharacterData[];
  sceneElement: ElementState;
  sceneInputMode?: ElementInputMode; // Optional for backward compatibility with older saves
  imageInput: ElementState;
  additionalReferenceImages?: ElementState[];
  generatedImage?: string | null; // Selected primary render (legacy-compatible)
  generatedImages?: string[]; // Full primary render batch, if the provider returned multiple images
  selectedGeneratedImageIndex?: number; // Selected index within generatedImages
  primaryGenerationMetadata?: GenerationOutputMetadata | null;
  sceneHistory?: SceneHistoryEntry[]; // Base64 or relative file paths
  apiProvider?: string; // Provider ID from registry (e.g., 'gemini', 'kie-ai')
  videoApiProvider?: string; // Video provider ID (independent from image provider)
  selectedModel?: string; // Model ID (e.g., 'nano-banana-pro', 'seedream-4.5')
  videoState?: SavedVideoProjectState;
  costSnapshot?: ProjectCostSnapshot; // Embedded cost tracking data
  filePath?: string; // Transient — set by load handler, not persisted
}

export interface RecentProject {
  path: string;
  name: string;
  lastOpened: number; // Unix ms
  projectId: string;
}

export type UnsavedChangesAction = 'save' | 'discard' | 'cancel';

export interface ProcessReferenceVideoRequest {
  filePath?: string;
  fileBase64?: string;
  fileName?: string;
  mimeType?: string;
  maxDurationSec: number;
  maxFileSizeBytes?: number;
  requireMp4?: boolean;
  minPixelCount?: number;
  maxPixelCount?: number;
}

export interface ProcessReferenceVideoResult {
  processedBase64: string;
  mimeType: 'video/mp4';
  durationSec: number;
  wasTrimmed: boolean;
  wasConverted: boolean;
  wasResized?: boolean;
  outputBytes: number;
}

export type ComfyUiAuthType = 'none' | 'bearer' | 'header';

export interface ComfyUiAuthConfig {
  type: ComfyUiAuthType;
  token: string;
  headerName?: string;
}

export interface ComfyUiWorkflowApiNode {
  class_type: string;
  inputs?: Record<string, unknown>;
  _meta?: {
    title?: string;
  };
}

export type ComfyUiWorkflowDefinition = Record<string, ComfyUiWorkflowApiNode>;

export interface ComfyUiWorkflowProfile {
  id: string;
  name: string;
  workflow: ComfyUiWorkflowDefinition;
  importedAt: number;
  description?: string;
}

export interface ComfyUiConfig {
  baseUrl: string;
  auth: ComfyUiAuthConfig;
  imageProfiles: ComfyUiWorkflowProfile[];
  videoProfiles: ComfyUiWorkflowProfile[];
}

export type SuiteAppId = string;
export type SuiteAppEntitlementStatus = 'owned' | 'not_owned' | 'unknown';

export interface SuiteAppDefinition {
  id: SuiteAppId;
  name: string;
  accent: 'yellow' | 'blue' | string;
}

export interface SuiteAppStatus extends SuiteAppDefinition {
  version: string | null;
  launchPath: string | null;
  lastSeenAt: string | null;
  installed: boolean;
  entitlementStatus: SuiteAppEntitlementStatus;
}

export interface SharedProviderConfigMap {
  comfyui?: ComfyUiConfig;
  [providerId: string]: unknown;
}

export interface SharedProviderStoreSnapshot {
  version?: number;
  imageProviderId: string | null;
  videoProviderId: string | null;
  credentials: Record<string, string>;
  providerConfigs?: SharedProviderConfigMap;
}

export type SharedProviderStoreSnapshotV2 = SharedProviderStoreSnapshot;

export type SuitePackageKind =
  | 'provider'
  | 'model-catalog'
  | 'comfyui-pack'
  | 'plugin'
  | 'update';

export interface InstalledSuitePackage {
  id: string;
  name: string;
  version: string;
  packageKind: SuitePackageKind | string;
  installPath: string;
  installedAt: string;
}

export interface SuiteRootSnapshot {
  success: boolean;
  rootPath?: string;
  coreVersion?: string;
  installedPackages?: InstalledSuitePackage[];
  canceled?: boolean;
  error?: string;
}

export interface IElectronAPI {
  platform: string;
  notifyRendererReady?: () => void;
  httpFetch?: (url: string, options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    bodyIsBase64?: boolean;
    responseType?: 'json' | 'base64';
    quiet?: boolean;
  }) => Promise<{ ok: boolean; status: number; data: any; base64?: string; contentType?: string; error?: string }>;
  kieMultipartUpload?: (params: {
    url?: string;
    apiKey: string;
    fileBase64: string;
    fileName?: string;
    mimeType?: string;
    uploadPath?: string;
  }) => Promise<{ ok: boolean; status: number; data: any; error?: string }>;
  comfyUiMultipartUpload?: (params: {
    url: string;
    headers?: Record<string, string>;
    fileBase64: string;
    fileName?: string;
    mimeType?: string;
    fieldName?: string;
    fields?: Record<string, string>;
  }) => Promise<{ ok: boolean; status: number; data: any; error?: string }>;
  saveImage: (imageData: string, filename?: string, promptText?: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  saveVideo?: (videoData: string | { url: string; headers?: Record<string, string> }, filename?: string, promptText?: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  downloadImage: (imageData: string, suggestedFilename?: string, promptText?: string) => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
  downloadVideo?: (videoData: string | { url: string; headers?: Record<string, string> }, suggestedFilename?: string, promptText?: string) => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
  saveAssets: (files: { name: string; base64Data: string }[]) => Promise<{ success: boolean; folderPath?: string; error?: string }>;
  readPresets: () => Promise<{ success: boolean; data: Preset[]; error?: string }>;
  writePreset: (filename: string, data: Preset) => Promise<{ success: boolean; error?: string }>;
  deletePreset: (filename: string) => Promise<{ success: boolean; error?: string }>;
  openFolder: (folderName: 'presets' | 'generations' | 'characters') => Promise<{ success: boolean; error?: string }>;
  readClipboardText?: () => Promise<string>;
  // Character Library APIs
  readCharacters: () => Promise<{ success: boolean; data: SavedCharacter[]; error?: string }>;
  writeCharacter: (filename: string, data: SavedCharacter) => Promise<{ success: boolean; error?: string }>;
  deleteCharacter: (filename: string) => Promise<{ success: boolean; error?: string }>;
  processReferenceVideo?: (request: ProcessReferenceVideoRequest) => Promise<ProcessReferenceVideoResult>;
  // Project file APIs
  saveProject: (data: ProjectFile) => Promise<{ success: boolean; path?: string; error?: string }>;
  saveProjectToPath: (data: ProjectFile, filePath: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  saveNewProject?: (data: ProjectFile) => Promise<{ success: boolean; path?: string; error?: string }>;
  loadProject: () => Promise<{ success: boolean; data?: ProjectFile; canceled?: boolean; error?: string; filePath?: string }>;
  loadProjectFromPath: (filePath: string) => Promise<{ success: boolean; data?: ProjectFile; error?: string }>;
  // Recent projects & project directory
  getRecentProjects: () => Promise<RecentProject[]>;
  listProjectsFolder: () => Promise<{ name: string; path: string; lastModified: number }[]>;
  // Plugin APIs
  loadPlugins: () => Promise<LoadedPlugin[]>;
  installPlugin: (filePath: string) => Promise<{ success: boolean; message: string }>;
  uninstallPlugin: (pluginId: string) => Promise<{ success: boolean; message: string }>;
  openPluginsFolder: () => Promise<void>;
  onInstallPluginFile: (callback: (filePath: string) => void) => void;
  // Update system APIs
  applyUpdateFile?: (filePath: string) => Promise<{ success: boolean; message: string }>;
  applySuitePackage?: (filePath: string) => Promise<{ success: boolean; message: string }>;
  checkForUpdates?: () => Promise<{ available: boolean; version?: string; url?: string }>;
  // Shared provider store APIs
  getSharedProviderStore?: () => Promise<SharedProviderStoreSnapshot>;
  saveSharedProviderSelection?: (selection: {
    imageProviderId?: string | null;
    videoProviderId?: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
  saveSharedProviderCredential?: (providerId: string, key: string) => Promise<{ success: boolean; error?: string }>;
  removeSharedProviderCredential?: (providerId: string) => Promise<{ success: boolean; error?: string }>;
  getSuiteRoot?: () => Promise<SuiteRootSnapshot>;
  selectSuiteRoot?: () => Promise<SuiteRootSnapshot>;
  getInstalledPackages?: () => Promise<InstalledSuitePackage[]>;
  getSuiteApps?: () => Promise<SuiteAppStatus[]>;
  openSuiteApp?: (appId: SuiteAppId) => Promise<{ success: boolean; error?: string }>;
  // User-installed providers
  loadUserProviders?: () => Promise<UserProviderManifest[]>;
  loadSuiteModelCatalogs?: () => Promise<UserProviderManifest[]>;
  onProviderInstalled?: (callback: (manifest: UserProviderManifest) => void) => void;
  // ComfyUI provider config
  getComfyUiConfig?: () => Promise<ComfyUiConfig>;
  saveComfyUiConfig?: (config: ComfyUiConfig) => Promise<{ success: boolean; error?: string }>;
  // Cost Tracker APIs
  getCostLedger?: () => Promise<CostLedger>;
  saveCostLedger?: (ledger: CostLedger) => Promise<{ success: boolean; error?: string }>;
  addCostEntry?: (entry: CostEntry) => Promise<{ success: boolean; error?: string }>;
  // Render History APIs
  getRenderHistory?: () => Promise<RenderHistory>;
  addRenderHistoryEntry?: (entry: RenderHistoryEntry) => Promise<{ success: boolean; error?: string }>;
  clearRenderHistory?: () => Promise<{ success: boolean; error?: string }>;
  // Menu event listeners
  onOpenCostTracker?: (callback: () => void) => () => void;
  onMenuNewProject?: (callback: () => void) => () => void;
  onMenuSaveProject?: (callback: () => void) => () => void;
  onMenuSaveAsProject?: (callback: () => void) => () => void;
  onMenuLoadProject?: (callback: () => void) => () => void;
  onMenuHome?: (callback: () => void) => () => void;
  // Close confirmation
  onRequestClose?: (callback: () => void) => () => void;
  confirmClose?: () => void;
  cancelClose?: () => void;
  reloadAppContent?: () => void;
  // Expansion app APIs
  launchExpansion?: (expansionId: string) => Promise<{ success: boolean; error?: string }>;
  closeExpansion?: (expansionId: string) => Promise<{ success: boolean }>;
  // License APIs
  openExternal?: (url: string) => Promise<void>;
  getLicenseStatus?: () => Promise<LicenseStatus>;
  activateLicense?: (licenseKey: string) => Promise<LicenseStatus>;
  refreshLicense?: (options?: { force?: boolean }) => Promise<LicenseStatus>;
  clearLicense?: () => Promise<LicenseStatus>;
}

declare global {
  interface Window {
    electron?: IElectronAPI;
  }
}

// ============================================
// LICENSE TYPES
// ============================================

export interface LicenseStatus {
  appId: string;
  appName: string;
  productIdConfigured: boolean;
  status: 'owned' | 'not_owned';
  entitlementStatus: string;
  reason: string;
  message: string;
  maxUses: number;
  uses: number | null;
  buyerEmail: string | null;
  licenseKeyMasked: string | null;
  lastVerifiedAt: string | null;
  nextCheckAt: string | null;
  graceExpiresAt: string | null;
  requiresRefresh: boolean;
  purchase: Record<string, unknown> | null;
}

// ============================================
// PLUGIN SYSTEM TYPES
// ============================================

export type PluginType = 'content' | 'feature';

export type PluginCategory = 'camera' | 'lighting' | 'lens' | 'filmStock' | 'shotType' | 'genre' | 'photographer' | 'movieLook' | 'filter' | 'movementPrompt';

export interface PluginManifestBase {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: PluginType;
  icon?: string;
}

export interface ContentPackManifest extends PluginManifestBase {
  type: 'content';
  extends: PluginCategory;
  options: string; // relative path to options.json
  images: string;  // relative path to images folder
}

export interface ContentPackOption {
  value: string;
  label: string;
  image: string;
  promptAddition?: string; // Optional extra prompt text
}

export interface FeaturePluginManifest extends PluginManifestBase {
  type: 'feature';
  entry: string; // relative path to index.html
  window: {
    width: number;
    height: number;
    resizable: boolean;
  };
  integrations: PluginIntegration[];
}

export interface PluginIntegration {
  action: keyof PluginIntegrationAPI;
  label: string;
  description: string;
}

export type PluginManifest = ContentPackManifest | FeaturePluginManifest;

export interface LoadedContentPack {
  manifest: ContentPackManifest;
  options: ContentPackOption[];
  path: string;
}

export interface LoadedFeaturePlugin {
  manifest: FeaturePluginManifest;
  path: string;
}

export type LoadedPlugin = LoadedContentPack | LoadedFeaturePlugin;

export interface PluginIntegrationAPI {
  sendToPersonSlot(personIndex: number, data: {
    faceDescription?: string;
    hairDescription?: string;
    bodyDescription?: string;
    clothingDescription?: string;
    fullDescription?: string;
  }): Promise<void>;

  sendToGlobalReference(data: {
    imageBase64: string;
    instruction: string;
  }): Promise<void>;

  sendToLighting(value: string, customPrompt?: string): Promise<void>;

  getProjectState(): Promise<unknown>;

  notify(message: string, type: 'success' | 'info' | 'error'): void;
}

export interface PluginRegistry {
  contentPacks: LoadedContentPack[];
  featurePlugins: LoadedFeaturePlugin[];
}

// ============================================
// COST TRACKING TYPES
// ============================================

export type CostUnit = 'usd' | 'credits';

/** A single generation cost record */
export interface CostEntry {
  /** Unique entry ID */
  id: string;
  /** Unix timestamp of generation */
  timestamp: number;
  /** Project ID this generation belongs to */
  projectId: string;
  /** Project display name */
  projectName: string;
  /** Provider ID (e.g., 'gemini', 'kie-ai', 'fal-ai') */
  providerId: string;
  /** Provider display name */
  providerName: string;
  /** Model ID (e.g., 'nano-banana-pro', 'seedance-1.5-pro-i2v') */
  modelId: string;
  /** Image size used ('1K', '2K', '4K') — image generations only */
  imageSize: string;
  /** Optional image quality tier for models that bill separately by quality. */
  imageQuality?: 'low' | 'medium' | 'high';
  /** Image operation kind for pricing-sensitive models. */
  imageOperation?: 'generate' | 'edit' | 'scene';
  /** Aspect ratio used */
  aspectRatio: string;
  /** Number of images returned by the generation */
  imageCount: number;
  /** Number of outputs billed for pricing math (may differ from imageCount for batched models). */
  billedImageCount?: number;
  /** Optional image-mode label shown in history/details (for example "Speed" or "Quality"). */
  imageModeLabel?: string;
  /** Cost unit. Missing values are treated as USD for backward compatibility. */
  costUnit?: CostUnit;
  /** Cost per unit (per image or per second depending on generationType) */
  unitCost: number;
  /** Total cost for this generation in costUnit */
  totalCost: number;
  /** Whether this was a scene generation */
  isScene: boolean;
  /** Whether pricing data was available (false = provider has no known rate) */
  hasPricing: boolean;
  /** Provider-specific pricing metadata captured at completion when available. */
  pricingMetadata?: unknown;
  /** Type of generation: 'image' or 'video'. Defaults to 'image' for backward compat. */
  generationType?: 'image' | 'video';
  /** Video duration in seconds — video generations only */
  duration?: number;
  /** Billable duration in seconds when pricing differs from output duration. */
  billedDuration?: number;
  /** Whether the video used a reference video input that affects billing. */
  hasVideoInput?: boolean;
  /** Reference-video duration in seconds used in billing math. */
  inputVideoDuration?: number;
  /** Number of imported reference-audio clips used in task-aware video pricing. */
  referenceAudioCount?: number;
  /** Video resolution (e.g., '720p', '1080p') — video generations only */
  resolution?: string;
  /** Whether audio was generated with the video — video generations only */
  withAudio?: boolean;
  /** Video model display name — video generations only */
  videoModelName?: string;
  /** Video task used for the render (e.g. textToVideo, imageToVideo). */
  videoTask?: string;
  /** Whether Wavespeed Seedance 2 turbo mode was enabled for this render. */
  seedanceTurboMode?: boolean;
  /** Provider-specific controls used for a video render. */
  providerControls?: Record<string, string | number | boolean>;
}

/** Custom pricing rate for a provider/model combination (images) */
export interface CustomPricingRate {
  /** Cost per image at 1K/2K resolution */
  standard: number;
  /** Cost per image at 4K resolution */
  fourK: number;
  /** Unit for this custom rate. Defaults to USD. */
  costUnit?: CostUnit;
}

/** Custom pricing rate for a video provider/model combination */
export interface CustomVideoPricingRate {
  /** Unit for this custom rate. Defaults to USD. */
  costUnit?: CostUnit;
  /** Legacy flat cost per second (backward compat for simple rates) */
  perSecond?: number;
  /** Resolution-aware pricing: resolution key → { withAudio, silent, withVoice? } cost per second */
  rates?: Record<string, { withAudio: number; silent: number; withVoice?: number }>;
  /** Optional exact total-cost overrides: resolution -> duration seconds -> total USD. */
  durationTotals?: Record<string, Record<string, { withAudio: number; silent: number; withVoice?: number }>>;
  /** Flat fee added on top of per-second cost (e.g., image input fee) */
  flatFee?: number;
  /** Minimum billable duration for per-second pricing, when provider billing has a floor. */
  minimumBilledSeconds?: number;
}

/** Persistent cost ledger stored in settings.json */
export interface CostLedger {
  /** All generation cost entries */
  entries: CostEntry[];
  /** User-defined custom image rates: providerId → modelId → rate */
  customRates: Record<string, Record<string, CustomPricingRate>>;
  /** User-defined custom video rates: providerId → modelId → rate */
  customVideoRates?: Record<string, Record<string, CustomVideoPricingRate>>;
}

// ============================================
// RENDER HISTORY — Persistent log of all video renders
// ============================================

/** A single entry in the persistent render history log. */
export interface RenderHistoryEntry {
  /** Unique entry ID (matches queue item ID). */
  id: string;
  /** Unix timestamp when the render completed. */
  timestamp: number;
  /** Human-readable model name. */
  modelName: string;
  /** Full prompt text. */
  prompt: string;
  /** Resolution used (e.g. '720p', '1080p', '4k', 'default'). */
  resolution: string;
  /** Aspect ratio used (e.g. '16:9', '9:16'). */
  aspectRatio: string;
  /** Requested duration in seconds. */
  duration: string;
  /** Outcome of the render. */
  status: 'completed' | 'failed';
  /** Total render time in milliseconds. */
  renderTimeMs: number;
  /** Seed used (if returned by provider). */
  seed: number | null;
  /** Absolute path where the video was saved (if auto-saved). */
  savedPath: string | null;
  /** Error message (for failed renders). */
  error?: string;
}

/** Persistent render history stored as a separate JSON file. */
export interface RenderHistory {
  entries: RenderHistoryEntry[];
}

/** Cost snapshot embedded in project files for portability */
export interface ProjectCostSnapshot {
  projectId: string;
  projectName: string;
  totalCost: number;
  totalImages: number;
  totalVideos: number;
  generationCount: number;
  entries: CostEntry[];
}

// ============================================
// USER-INSTALLED PROVIDER TYPES
// ============================================

export type UserProviderAuthScheme = 'bearer' | 'x-api-key' | 'query' | 'none';
export type UserProviderHttpMethod = 'POST' | 'GET';
export type DeclarativeImageWorkflow = 'generate' | 'referenceGenerate' | 'edit' | 'scene';
export type DeclarativeControlType = 'select' | 'toggle' | 'number' | 'text';
export type DeclarativeValidationRuleKind =
  | 'required'
  | 'minItems'
  | 'maxItems'
  | 'min'
  | 'max'
  | 'oneOf'
  | 'durationMin'
  | 'durationMax';

export interface DeclarativeControlOption {
  label: string;
  value: string | number | boolean;
}

export interface DeclarativeProviderControl {
  /** Stable control ID exposed to the app UI/state layer. */
  id: string;
  /** Short display label. */
  label: string;
  /** Generic control type rendered by the app. */
  type: DeclarativeControlType;
  /** Request source name used by fieldMappings, defaults to id. */
  source?: string;
  /** Direct request body field, for simple controls that do not need a fieldMapping entry. */
  field?: string;
  options?: DeclarativeControlOption[];
  defaultValue?: unknown;
  min?: number;
  max?: number;
  step?: number;
  /** Optional workflow/task IDs where this control is visible. */
  workflows?: string[];
}

export interface DeclarativeValidationRule {
  /** Request property to validate, such as duration, referenceImageUrls, or referenceAudioUrls. */
  source?: string;
  sources?: string[];
  kind: DeclarativeValidationRuleKind;
  min?: number;
  max?: number;
  allowedValues?: Array<string | number | boolean>;
  message?: string;
}

export interface DeclarativeUploadConstraints {
  minImages?: number;
  maxImages?: number;
  minVideos?: number;
  maxVideos?: number;
  minAudios?: number;
  maxAudios?: number;
  maxTotalFiles?: number;
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
  maxAudioDurationSeconds?: number;
  supportedMimeTypes?: string[];
}

export interface DeclarativeFieldMapping {
  /** Dot-notation path in a JSON payload. */
  field: string;
  /** Request property to read, such as prompt, aspectRatio, imageSize, model, seed. */
  source?: string;
  /** Ordered request properties to read and merge into one field. Arrays are flattened and empty values are removed. */
  sources?: string[];
  /** Only apply this mapping when at least one named request property is present. */
  requiresAnySource?: string[];
  /** Only apply this mapping when a request/control source matches one of these values. */
  requiresSourceValue?: {
    source: string;
    values?: Array<string | number | boolean>;
  };
  /** Optional fallback when the source value is absent. */
  defaultValue?: unknown;
  /** Optional primitive coercion applied before the value is written. */
  valueType?: 'string' | 'number' | 'boolean';
  /** Optional declarative replacement map applied before coercion. */
  valueMap?: Record<string, unknown>;
  /** Optional media kind; local data values are resolved through manifest-declared asset uploads. */
  mediaKind?: 'image' | 'video' | 'audio';
  /** When true, only HTTP(S) URL string values are mapped. */
  onlyHttpUrls?: boolean;
  /** When true, HTTP(S) URL string values are ignored. */
  skipHttpUrls?: boolean;
}

export interface DeclarativeJobMapping {
  /** Dot-notation path to the provider job/request id after submit. */
  jobIdField?: string;
  /** Endpoint used to poll a queued job. Supports {jobId} token replacement. */
  statusEndpoint?: string;
  /** HTTP method for status polling. */
  statusMethod?: UserProviderHttpMethod;
  /** Dot-notation path to the status value in the polling response. */
  statusField?: string;
  /** Values considered complete. */
  successStatuses?: string[];
  /** Values considered failed. */
  failureStatuses?: string[];
  /** Poll interval in milliseconds. */
  pollIntervalMs?: number;
  /** Max time to wait for completion. */
  timeoutMs?: number;
  /** Optional path for a provider error message in submit/status responses. */
  errorField?: string;
}

export interface DeclarativeResponseAssetLookup {
  /** Dot-notation path to the generated asset id in the submit/status response. */
  assetIdField: string;
  /** Endpoint used to fetch the generated asset. Supports {assetId} token replacement. */
  endpoint: string;
  /** HTTP method for the asset lookup. Defaults to GET. */
  method?: UserProviderHttpMethod;
  /** Dot-notation paths to try for a generated asset URL in the lookup response. */
  responseFields: string[];
}

export interface DeclarativeMultipartUploadMapping {
  /** Endpoint used to upload a file before submit. */
  endpoint: string;
  /** Multipart form field name for the uploaded file. */
  fileField: string;
  /** Optional additional fields sent with the upload. */
  staticFields?: Record<string, string>;
  /** Dot-notation path to the uploaded URL or id in the response. */
  responseField: string;
}

export interface DeclarativeAssetCreateMapping {
  /** Endpoint used to create/register an asset before binary upload. */
  endpoint: string;
  /** HTTP method for the create endpoint. Defaults to POST. */
  method?: UserProviderHttpMethod;
  /** Static JSON fields merged into the asset-create request. */
  staticFields?: Record<string, unknown>;
  /** Optional field receiving the upload file name. */
  nameField?: string;
  /** Optional field receiving the upload MIME type. */
  mimeTypeField?: string;
  /** Dot-notation path to the created asset id. */
  responseField: string;
}

export interface DeclarativeImageReferenceUploadMapping {
  /** Optional create/register step before upload. Supports endpoints like /assets/{assetId}/upload. */
  create?: DeclarativeAssetCreateMapping;
  /** Endpoint used to upload a local reference image before submit. */
  endpoint: string;
  /** HTTP method for the upload endpoint. Defaults to POST. */
  method?: UserProviderHttpMethod;
  /** Upload body type. Defaults to json-base64. */
  contentType?: 'json-base64' | 'multipart' | 'url';
  /** JSON field for base64/data-url uploads. Defaults to base64_data. */
  dataField?: string;
  /** Multipart form field name for file uploads. Defaults to file. */
  fileField?: string;
  /** Optional JSON/multipart field for a generated file name. */
  fileNameField?: string;
  /** Optional JSON/multipart field for the MIME type. */
  mimeTypeField?: string;
  /** Static fields merged into every upload request. */
  staticFields?: Record<string, unknown>;
  /** Whether JSON uploads send a data URL or raw base64. Defaults to data-url. */
  base64Format?: 'data-url' | 'raw';
  /** Dot-notation path to the uploaded file URL/id in the upload response. */
  responseField: string;
}

export interface DeclarativeAssetUploadMapping extends DeclarativeImageReferenceUploadMapping {
  /** Optional JSON field for uploading an already-hosted URL by reference. */
  urlField?: string;
  /** Supported MIME types for local uploads. */
  supportedMimeTypes?: string[];
  /** Maximum accepted local file size in bytes. */
  maxBytes?: number;
}

export interface DeclarativeImageReferenceMapping {
  /** Dot-notation path in the generation body that receives references. */
  field: string;
  /** Shape of the generated value. Defaults to array. */
  valueFormat?: 'array' | 'single';
  /** Maximum number of references to send, applied in input order. */
  maxImages?: number;
  /** How local references should be converted before submit. */
  transport?: 'data-url' | 'remote-url' | 'upload';
  /** Upload settings used when transport is upload. */
  upload?: DeclarativeImageReferenceUploadMapping;
}

export interface DeclarativeProviderModelManifest {
  id: string;
  name: string;
  providerModelId?: string;
  endpoint?: string;
  modality?: 'image' | 'video' | 'both';
  tasks?: string[];
  description?: string;
  supportsEdit?: boolean;
  supportsMultiAngle?: boolean;
  supportsResolution?: boolean;
  supportsGrounding?: boolean;
  supportsFStop?: boolean;
  supportsImageQuality?: boolean;
  supportsReferenceImages?: boolean;
  maxReferenceImages?: number;
  referenceLabelMode?: 'image' | 'file';
  supportedAspectRatios?: string[];
  supportedImageSizes?: string[];
  supportedResolutions?: string[];
  supportedDurations?: string[];
  supportedFrameRates?: string[];
  defaultResolution?: string;
  defaultAspectRatio?: string;
  defaultImageSize?: string;
  inputSchema?: Record<string, unknown>;
  pricing?: Record<string, unknown>;
  controls?: DeclarativeProviderControl[];
  validationRules?: DeclarativeValidationRule[];
  uploadConstraints?: DeclarativeUploadConstraints;
  requestMapping?: {
    promptField?: string;
    aspectRatioField?: string;
    fields?: DeclarativeFieldMapping[];
    staticFields?: Record<string, unknown>;
  };
  responseMapping?: {
    imageField?: string;
    imageFields?: string[];
    videoUrlField?: string;
    videoUrlFields?: string[];
    mimeType?: string;
    assetLookup?: DeclarativeResponseAssetLookup;
  };
  referenceImageMapping?: DeclarativeImageReferenceMapping;
  workflowMappings?: Partial<Record<DeclarativeImageWorkflow, DeclarativeProviderModelWorkflowMapping>>;
  taskMappings?: Record<string, DeclarativeProviderModelTaskMapping>;
}

export interface DeclarativeProviderModelWorkflowMapping {
  providerModelId?: string;
  endpoint?: string;
  supportedAspectRatios?: string[];
  supportedImageSizes?: string[];
  defaultAspectRatio?: string;
  defaultImageSize?: string;
  supportsReferenceImages?: boolean;
  maxReferenceImages?: number;
  controls?: DeclarativeProviderControl[];
  validationRules?: DeclarativeValidationRule[];
  uploadConstraints?: DeclarativeUploadConstraints;
  requestMapping?: {
    promptField?: string;
    aspectRatioField?: string;
    fields?: DeclarativeFieldMapping[];
    staticFields?: Record<string, unknown>;
  };
  responseMapping?: {
    imageField?: string;
    imageFields?: string[];
    videoUrlField?: string;
    videoUrlFields?: string[];
    mimeType?: string;
    assetLookup?: DeclarativeResponseAssetLookup;
  };
  referenceImageMapping?: DeclarativeImageReferenceMapping;
}

export interface DeclarativeProviderModelTaskMapping {
  providerModelId?: string;
  /** Per-resolution provider model/endpoint selection. */
  providerModelIdByResolution?: Record<string, string>;
  /** Provider model/endpoint selected by a declarative control value. */
  providerModelIdByControl?: {
    source: string;
    defaultValue?: string | number | boolean;
    values: Record<string, string>;
  };
  endpoint?: string;
  supportedAspectRatios?: string[];
  supportedResolutions?: string[];
  supportedDurations?: string[];
  supportedFrameRates?: string[];
  defaultResolution?: string;
  defaultAspectRatio?: string;
  inputSchema?: Record<string, unknown>;
  controls?: DeclarativeProviderControl[];
  validationRules?: DeclarativeValidationRule[];
  uploadConstraints?: DeclarativeUploadConstraints;
  requestMapping?: {
    promptField?: string;
    aspectRatioField?: string;
    fields?: DeclarativeFieldMapping[];
    staticFields?: Record<string, unknown>;
  };
  responseMapping?: {
    videoUrlField?: string;
    videoUrlFields?: string[];
    imageField?: string;
    imageFields?: string[];
    mimeType?: string;
    assetLookup?: DeclarativeResponseAssetLookup;
  };
}

/**
 * Manifest schema for a .nbprovider package.
 * Defines how to interact with an external image generation API.
 */
export interface UserProviderManifest {
  /** Manifest schema version. Runtime V2 providers should use 2. */
  manifestVersion?: number;
  /** Minimum app/provider-runtime version required to safely use this package. */
  minCoreVersion?: string;
  /** Unique provider ID (e.g., 'my-custom-api') */
  id: string;
  /** Display name for UI */
  name: string;
  /** Semantic version */
  version: string;
  /** Author */
  author?: string;
  /** Short description */
  description?: string;
  /** Optional provider dashboard / API-key management URL shown in settings. */
  dashboardUrl?: string;
  /** Optional provider billing / credits URL shown in settings. */
  billingUrl?: string;
  /** Model name used by this provider */
  modelName: string;
  /** Base API endpoint URL */
  endpoint: string;
  /** Authentication scheme */
  authScheme: UserProviderAuthScheme;
  /** Optional protocol handler for declarative providers/catalogs. */
  protocol?: 'generic-json' | 'fal-queue';
  /** Optional provider id whose saved credential should be reused. */
  credentialProviderId?: string;
  /** Optional built-in provider id that this model catalog extends. */
  targetProviderId?: string;
  /** Optional suite app IDs this provider is intended for, e.g. studio/animate. */
  suiteAppIds?: string[];
  /** Optional feature tags used by installers or future migrations. */
  featuresUsed?: string[];
  /** Query parameter name for API key (when authScheme is 'query') */
  authQueryParam?: string;
  /** Custom header name for API key (when authScheme is 'x-api-key') */
  authHeaderName?: string;
  /** Optional prefix for custom API-key headers, such as "Key " for Fal.ai Authorization. */
  authHeaderPrefix?: string;
  /** HTTP method for the generate endpoint */
  httpMethod?: UserProviderHttpMethod;
  /** How to map the prompt request to the API body */
  requestMapping: {
    /** JSON path/key for the prompt text */
    promptField: string;
    /** JSON path/key for aspect ratio (optional) */
    aspectRatioField?: string;
    /** Additional static body fields merged into every request */
    staticFields?: Record<string, unknown>;
  };
  /** How to extract the image from the API response */
  responseMapping: {
    /** JSON path to the base64 image data in the response */
    imageField: string;
    /** JSON paths to a batch of generated image data values. */
    imageFields?: string[];
    /** JSON path to a generated video URL for declarative video providers. */
    videoUrlField?: string;
    /** Fallback JSON paths to generated video URLs for declarative video providers. */
    videoUrlFields?: string[];
    /** MIME type of returned images (default: 'image/png') */
    mimeType?: string;
    /** Optional generated asset lookup used when submit/status responses only return asset_id. */
    assetLookup?: DeclarativeResponseAssetLookup;
  };
  /** Optional declarative model catalog shipped inside this provider package. */
  models?: DeclarativeProviderModelManifest[];
  /** Provider-level generic controls available to model/workflow mappings. */
  controls?: DeclarativeProviderControl[];
  /** Provider-level validation rules. */
  validationRules?: DeclarativeValidationRule[];
  /** Provider-level upload constraints. */
  uploadConstraints?: DeclarativeUploadConstraints;
  /** Provider-level image workflow defaults used when a model does not override them. */
  imageWorkflowMappings?: Partial<Record<DeclarativeImageWorkflow, DeclarativeProviderModelWorkflowMapping>>;
  /** Optional queued-job behavior for providers that submit then poll. */
  jobMapping?: DeclarativeJobMapping;
  /** Optional pre-submit upload mapping for image/video/audio reference files. */
  uploadMapping?: DeclarativeMultipartUploadMapping;
  /** Generic manifest-declared uploads for local image, video, or audio assets. */
  assetUploads?: Partial<Record<'image' | 'video' | 'audio', DeclarativeAssetUploadMapping>>;
  /** Optional pre-submit handling for image reference inputs. */
  referenceImageMapping?: DeclarativeImageReferenceMapping;
  /** Optional extended request fields beyond the legacy prompt/aspect/static mapping. */
  fieldMappings?: DeclarativeFieldMapping[];
  /** Supported aspect ratios */
  supportedAspectRatios?: string[];
  /** Supported image sizes */
  supportedImageSizes?: string[];
  /** Optional pricing per image (for cost tracking) */
  pricing?: Record<string, unknown>;
  /** Package integrity fields (injected by sign-package.cjs) */
  fileHash?: string;
  signature?: string;
}
