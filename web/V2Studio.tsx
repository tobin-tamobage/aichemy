import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  Download,
  Pencil,
  Redo2,
  Shuffle,
  Undo2,
  Search,
} from "lucide-react";
import type { LibraryItem } from "../shared/product";
import type {
  ClientBrief,
  StudioV2Descriptor,
  StudioV2State,
  VisualField,
  V2Draft,
} from "../shared/v2";
import { emptyBrief, isV2Draft } from "../shared/v2";
import {
  setImage,
  findService,
  findSet,
  serviceForRecipe,
} from "../shared/v2-catalog";
import {
  changeSet,
  legacyCopy,
  presetStyle,
  mapLegacyStyle,
} from "../shared/v2-state";
import { api, post } from "./api";
import { CURRENT_CATALOG, serviceChecklist } from "../shared/services-v3";
import { useSite } from "./context";
import { AssetImage, VisualChoices, EffectiveSummary } from "./V2Visuals";
import { Confirm, Modal } from "./ui";
import { Loading } from "./Access";
import { StudioPage as LegacyStudio } from "./Members";

interface Frame {
  state: StudioV2State;
  manual: string | null;
  clientModifiedAt?: string;
}
interface History {
  past: Frame[];
  present: Frame | null;
  future: Frame[];
}
type Action =
  { type: "replace" | "change"; value: Frame } | { type: "undo" | "redo" };
function reducer(h: History, a: Action): History {
  if (a.type === "replace") return { past: [], present: a.value, future: [] };
  if (a.type === "change")
    return {
      past: h.present ? [...h.past, h.present].slice(-50) : [],
      present: a.value,
      future: [],
    };
  if (a.type === "undo" && h.past.length && h.present)
    return {
      past: h.past.slice(0, -1),
      present: {
        ...h.past.at(-1)!,
        clientModifiedAt: new Date().toISOString(),
      },
      future: [h.present, ...h.future],
    };
  if (a.type === "redo" && h.future.length && h.present)
    return {
      past: [...h.past, h.present],
      present: { ...h.future[0], clientModifiedAt: new Date().toISOString() },
      future: h.future.slice(1),
    };
  return h;
}
export default function StudioRoute() {
  const { id = "product" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { notify, user } = useSite();
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [libraryKey, setLibraryKey] = useState("");
  const lastLegacy = useRef<string | null>(null);
  const [error, setError] = useState("");
  const [upgrade, setUpgrade] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const requested = params.get("draft");
  const explicit = params.has("service");
  const requestKey = `${id}:${requested ?? ""}`;
  useEffect(() => {
    let live = true;
    api<{ items: LibraryItem[] }>("/library")
      .then((r) => {
        if (live) {
          setItems(r.items);
          setLibraryKey(requestKey);
          setError("");
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [id, requested]);
  if (error)
    return (
      <div className="empty-state">
        <h1>Studio belum dapat dibuka.</h1>
        <p>{error}</p>
        <Link to="/app" className="button button-primary">
          Kembali ke jasa
        </Link>
      </div>
    );
  if (!items || !libraryKey.startsWith(`${id}:`)) return <Loading />;
  const refreshing = libraryKey !== requestKey;
  const preserveLegacy = refreshing && lastLegacy.current === id && !explicit;
  let draft = requested
    ? items.find(
        (i) => i.id === requested && i.kind === "draft" && i.studioId === id,
      )
    : !params.has("starter")
      ? items.find((i) => i.kind === "draft" && i.studioId === id)
      : undefined;
  if (requested && user) {
    try {
      const cached = JSON.parse(
        localStorage.getItem(`aichemy-pending-v2:${user.id}:${requested}`) ??
          "null",
      );
      if (
        isV2Draft(cached?.data) &&
        cached.studioId === id &&
        cached.data.clientModifiedAt >
          (draft?.data.clientModifiedAt ?? draft?.updatedAt ?? "")
      )
        draft = {
          id: requested,
          ...cached,
          updatedAt: cached.data.clientModifiedAt,
        };
    } catch {}
  }
  if (requested && !draft && refreshing && !preserveLegacy) return <Loading />;
  if (requested && !draft && !refreshing)
    return (
      <div className="empty-state">
        <h1>Draft tidak ditemukan.</h1>
        <p>Draft mungkin sudah dihapus atau tidak dimiliki akun ini.</p>
        <Link to="/app">Kembali ke jasa</Link>
      </div>
    );
  const legacy =
    id.startsWith("x-") ||
    (draft && draft.data.engineVersion !== 2) ||
    preserveLegacy ||
    (!explicit && !draft && params.get("starter") === "1");
  if (legacy) {
    lastLegacy.current = id;
    return (
      <>
        {!id.startsWith("x-") && draft && (
          <div className="v2-legacy-banner">
            <p>
              <strong>Draft mesin lama tetap utuh.</strong> Ingin mencoba blok
              prompt dan pilihan visual V2?
            </p>
            <button
              className="button button-outline"
              onClick={() => setUpgrade(true)}
            >
              Buat salinan V2 <ArrowRight size={15} />
            </button>
          </div>
        )}
        <LegacyStudio />
        {upgrade && draft && (
          <Modal title="Buat salinan ke V2?" onClose={() => setUpgrade(false)}>
            <p>
              Draft asli tidak diubah. Brief yang dikenali dan prompt manual
              akan disalin. Pilihan lama tidak dipaksakan menjadi pilihan baru:
              salinan dimulai dari set terkurasi dan menyimpan seluruh data
              sumber untuk rujukan.
            </p>
            <p className="v2-notice">
              Periksa kembali setiap pilihan. Salinan ini tidak mengklaim semua
              parameter V1 memiliki padanan V2.
            </p>
            <button
              className="button button-primary"
              disabled={upgrading}
              onClick={async () => {
                setUpgrading(true);
                try {
                  const copy = legacyCopy(draft);
                  const newId = crypto.randomUUID();
                  await api(`/library/${newId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                      kind: "draft",
                      studioId: id,
                      name: `${draft.name} — Salinan V2`,
                      data: copy,
                    }),
                  });
                  setUpgrade(false);
                  notify("Salinan V2 dibuat. Draft lama tidak berubah.");
                  navigate(
                    `/app/studio/${id}?service=${copy.state.serviceId}&draft=${newId}`,
                  );
                } catch (e) {
                  notify((e as Error).message, true);
                } finally {
                  setUpgrading(false);
                }
              }}
            >
              {upgrading ? "Menyalin…" : "Buat salinan, jangan ubah sumber"}
            </button>
          </Modal>
        )}
      </>
    );
  }
  lastLegacy.current = null;
  const service =
    findService(params.get("service") ?? "") ??
    findService((draft?.data.state as StudioV2State)?.serviceId ?? "") ??
    serviceForRecipe(id);
  if (!service || service.recipeId !== id)
    return (
      <div className="empty-state">
        <h1>Jasa tidak ditemukan.</h1>
        <Link to="/app">Pilih jasa lain</Link>
      </div>
    );
  return (
    <StudioV2
      key={`${id}-${requested ?? "new"}-${service.id}`}
      serviceId={service.id}
      initial={draft}
      items={items}
      setId={params.get("set") ?? undefined}
    />
  );
}
function StudioV2({
  serviceId,
  initial,
  items: initialItems,
  setId,
}: {
  serviceId: string;
  initial?: LibraryItem;
  items: LibraryItem[];
  setId?: string;
}) {
  const service = findService(serviceId)!;
  const navigate = useNavigate();
  const { notify, user } = useSite();
  const initialSet = findSet(setId ?? "");
  const first =
    initialSet?.serviceId === service.id ? initialSet : service.sets[0];
  const init: Frame =
    initial?.data.engineVersion === 2
      ? {
          state: initial.data.state as StudioV2State,
          manual:
            typeof initial.data.manual === "string"
              ? initial.data.manual
              : null,
          clientModifiedAt: String(
            initial.data.clientModifiedAt ?? new Date().toISOString(),
          ),
        }
      : {
          state: {
            catalogVersion: CURRENT_CATALOG,
            serviceId: service.id,
            setId: first.id,
            referenceMode:
              service.id === "branding" || service.id === "cinematic"
                ? "none"
                : service.id === "prewedding"
                  ? "couple"
                  : "single",
            brief: {
              ...emptyBrief(),
              brand: "",
            },
            selections: { ...first.selections },
          },
          manual: null,
          clientModifiedAt: new Date().toISOString(),
        };
  const [history, dispatch] = useReducer(reducer, {
    past: [],
    present: init,
    future: [],
  });
  const present = history.present!;
  const state = present.state;
  const selectedSet = findSet(state.setId) ?? first;
  const [descriptor, setDescriptor] = useState<StudioV2Descriptor | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [previewRetry, setPreviewRetry] = useState(0);
  const [busy, setBusy] = useState(true);
  const [stage, setStage] = useState(1);
  const [fieldQuery, setFieldQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState<"all" | "active" | "skipped">(
    "all",
  );
  const [mobile, setMobile] = useState<"build" | "prompt">("build");
  const [changed, setChanged] = useState<string[]>([]);
  const [saved, setSaved] = useState("Menyiapkan draft…");
  const [saveAttempt, setSaveAttempt] = useState(0);
  const [copied, setCopied] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [presetModal, setPresetModal] = useState<"apply" | "save" | null>(null);
  const [name, setName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<LibraryItem | null>(
    null,
  );
  const [overwrite, setOverwrite] = useState<LibraryItem | null>(null);
  const [resetManual, setResetManual] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);
  const [catalogUpgradeBusy, setCatalogUpgradeBusy] = useState(false);
  const draftId = useRef(initial?.id ?? crypto.randomUUID());
  const latest = useRef(present);
  latest.current = present;
  const requestNo = useRef(0);
  const lastBlocks = useRef<Record<string, string>>({});
  const describedStateKey = useRef("");
  const saveQueue = useRef(Promise.resolve());
  const lastConfirmed = useRef<Frame | null>(null);
  const mounted = useRef(true);
  const scrollPositions = useRef({ build: 0, prompt: 0 });
  const latestDescriptor = useRef(descriptor);
  latestDescriptor.current = descriptor;
  const briefFields: [keyof ClientBrief, string, string][] = [
    [
      "subject",
      service.id === "branding" ? "Brief merek / konsep" : "Subjek utama",
      selectedSet.subject,
    ],
    [
      "purpose",
      "Tujuan klien",
      "Contoh: foto profil LinkedIn atau katalog marketplace.",
    ],
    [
      "required",
      "Detail yang wajib ada",
      "Contoh: kemeja putih, kemasan harus terlihat jelas, ruang kosong di kiri.",
    ],
    [
      "preserve",
      "Yang tidak boleh berubah",
      "Contoh: identitas wajah, tahi lalat, bentuk botol, tulisan pada label.",
    ],
    ...(["branding", "ads", "social", "product"].includes(service.id)
      ? [
          [
            "brand",
            "Nama merek",
            "Ditulis persis seperti yang diperlukan.",
          ] as [keyof ClientBrief, string, string],
        ]
      : []),
    ...(["ads", "social", "branding", "cinematic"].includes(service.id)
      ? [
          [
            "text",
            "Teks yang diminta klien (opsional)",
            "Biarkan kosong untuk menyediakan ruang teks. Tidak membuat promo atau klaim otomatis.",
          ] as [keyof ClientBrief, string, string],
        ]
      : []),
  ];
  const setOptions = service.sets.slice(
    0,
    (state.catalogVersion ?? 1) >= 2 ? service.sets.length : 3,
  );
  const setField: VisualField = {
    key: "setId",
    label: "Gaya awal",
    help: "Pilih titik mulai. Kamu tetap bisa mengubah tiap detail setelahnya.",
    options: setOptions.map((s, index) => {
      const label = s.label.toLocaleLowerCase("id");
      const group =
        index < 3
          ? "Pilihan awal"
          : /adat|batik|kebaya/.test(label)
            ? "Adat modern"
            : /studio|minimal|netral/.test(label)
              ? "Studio"
              : /taman|pantai|senja|hutan|pegunungan|garden|alam|rooftop/.test(
                    label,
                  )
                ? "Luar ruang"
                : /sinematik|monokrom|editorial|malam/.test(label)
                  ? "Editorial"
                  : "Gaya lainnya";
      return {
        value: s.id,
        label: s.label,
        hint: s.description,
        group,
        keywords: [s.subject, s.changes],
        visual: {
          kind: "photo" as const,
          src: setImage(s.id, true),
        },
      };
    }),
  };
  const change = (next: Partial<Frame>) => {
    dispatch({
      type: "change",
      value: {
        ...latest.current,
        ...next,
        clientModifiedAt: new Date().toISOString(),
      },
    });
    setCopied(false);
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let live = true;
    const seq = ++requestNo.current;
    setBusy(true);
    const timer = setTimeout(() => {
      post<StudioV2Descriptor>(`/studios/${service.recipeId}/preview`, {
        engineVersion: 2,
        state,
      })
        .then((r) => {
          if (!live || seq !== requestNo.current) return;
          const updated = r.document.blocks
            .filter(
              (b) =>
                lastBlocks.current[b.id] && lastBlocks.current[b.id] !== b.text,
            )
            .map((b) => b.id);
          lastBlocks.current = Object.fromEntries(
            r.document.blocks.map((b) => [b.id, b.text]),
          );
          describedStateKey.current = JSON.stringify(state);
          setChanged(updated);
          setDescriptor(r);
          setPreviewError("");
        })
        .catch((e) => {
          if (live) setPreviewError(e.message);
        })
        .finally(() => {
          if (live) setBusy(false);
        });
    }, 200);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [state, service.recipeId, previewRetry]);
  useEffect(() => {
    if (!changed.length) return;
    const timer = setTimeout(() => setChanged([]), 1400);
    return () => clearTimeout(timer);
  }, [changed]);
  const payload = (frame: Frame) => ({
    kind: "draft",
    studioId: service.recipeId,
    name:
      initial?.name ??
      `${service.short} · ${findSet(frame.state.setId)?.label ?? "Racikan"}`,
    data: {
      schemaVersion: 2,
      engineVersion: 2,
      catalogVersion: frame.state.catalogVersion ?? 1,
      ...frame,
      ...(initial?.data.legacySource
        ? { legacySource: initial.data.legacySource }
        : {}),
    },
  });
  const persist = (frame: Frame, keepalive = false) =>
    api(`/library/${draftId.current}`, {
      method: "PUT",
      body: JSON.stringify(payload(frame)),
      keepalive,
    });
  useEffect(() => {
    setSaved("Perubahan belum tersimpan");
    const frame = present;
    const cacheKey = `aichemy-pending-v2:${user?.id}:${draftId.current}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(payload(frame)));
    } catch {}
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("service", service.id);
    url.searchParams.set("draft", draftId.current);
    window.history.replaceState(window.history.state, "", url);
    const timer = setTimeout(() => {
      setSaved("Menyimpan…");
      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(() => persist(frame))
        .then(() => {
          lastConfirmed.current = frame;
          if (mounted.current && latest.current === frame) {
            setSaved("Tersimpan di akun");
            try {
              localStorage.removeItem(cacheKey);
            } catch {}
          }
        })
        .catch((e) => {
          if (mounted.current) {
            setSaved("Gagal menyimpan · coba lagi");
            notify(e.message, true);
          }
        });
    }, 650);
    return () => clearTimeout(timer);
  }, [present, saveAttempt]);
  useEffect(() => {
    const flush = () => {
      if (latest.current !== lastConfirmed.current)
        persist(latest.current, true).catch(() => {});
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);
  const prompt = present.manual ?? descriptor?.document.text ?? "";
  const invalid = descriptor?.issues.some((i) => i.level === "error");
  const matchesField = (field: VisualField) => {
    const value =
      state.selections[field.key] ?? descriptor?.state.selections[field.key];
    if (fieldFilter === "active" && value === "__skip") return false;
    if (fieldFilter === "skipped" && value !== "__skip") return false;
    return `${field.label} ${field.help} ${field.options.map((o) => `${o.label} ${o.keywords?.join(" ") ?? ""}`).join(" ")}`
      .toLocaleLowerCase("id")
      .includes(fieldQuery.toLocaleLowerCase("id").trim());
  };
  const canUsePrompt =
    Boolean(prompt) &&
    (present.manual !== null ||
      (!busy &&
        !invalid &&
        !previewError &&
        describedStateKey.current === JSON.stringify(state)));
  async function copy() {
    if (!canUsePrompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      notify(
        "Prompt tersalin! Tempel bersama foto referensi di aplikasi AI pilihanmu.",
      );
    } catch {
      notify(
        "Belum bisa menyalin. Seleksi teks prompt lalu salin manual.",
        true,
      );
    }
  }
  function mobileTab(tab: "build" | "prompt") {
    scrollPositions.current[mobile] = window.scrollY;
    setMobile(tab);
    requestAnimationFrame(() =>
      window.scrollTo({
        top: scrollPositions.current[tab],
        behavior: "instant",
      }),
    );
  }
  const presets = items.filter(
    (i) =>
      i.kind === "preset" &&
      i.studioId === service.recipeId &&
      (i.data.engineVersion !== 2 ||
        (i.data.state as StudioV2State)?.serviceId === service.id),
  );
  async function savePreset(target?: LibraryItem) {
    setSavingPreset(true);
    try {
      const id = target?.id ?? crypto.randomUUID();
      const data: V2Draft = {
        schemaVersion: 2,
        engineVersion: 2,
        state: {
          ...state,
          // The preview can be stale or unavailable. Save the current controls;
          // the library API validates and resolves their effective values.
          selections: { ...state.selections },
          brief: emptyBrief(),
        },
        manual: null,
      };
      await api(`/library/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          kind: "preset",
          studioId: service.recipeId,
          name: name.trim(),
          data,
        }),
      });
      const r = await api<{ items: LibraryItem[] }>("/library");
      setItems(r.items);
      setPresetModal(null);
      setOverwrite(null);
      notify(
        target
          ? "Gaya diperbarui. Detail klien tetap terpisah."
          : "Gaya tersimpan! Siap dipakai lagi tanpa mengganti detailmu.",
      );
    } catch (e) {
      notify((e as Error).message, true);
    } finally {
      setSavingPreset(false);
    }
  }
  const applyPreset = () => {
    if (!selectedPreset) return;
    if (selectedPreset.data.engineVersion === 2)
      change({
        state: presetStyle(state, selectedPreset.data.state as StudioV2State),
      });
    else {
      const mapped = mapLegacyStyle(
        (selectedPreset.data.state ?? {}) as Record<string, unknown>,
        state,
        descriptor?.fields ?? [],
      );
      change({ state: mapped.state });
      notify(
        mapped.unavailable.length
          ? `Pilihan lama tanpa padanan: ${mapped.unavailable.join(", ")}. Tidak diterapkan; sumber preset tetap utuh.`
          : "Pilihan preset lama yang sesuai diterapkan. Brief dan sumber preset tetap utuh.",
      );
    }
    setPresetModal(null);
    setSelectedPreset(null);
  };
  const duplicateToCurrentCatalog = async () => {
    setCatalogUpgradeBusy(true);
    try {
      const id = crypto.randomUUID();
      const next: Frame = {
        ...present,
        state: { ...state, catalogVersion: CURRENT_CATALOG },
        clientModifiedAt: new Date().toISOString(),
      };
      await api(`/library/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...payload(next),
          name: `${initial?.name ?? service.short} · Salinan katalog baru`,
        }),
      });
      notify(
        "Salinan katalog baru dibuat. Draft lama dan prompt manual tetap utuh.",
      );
      navigate(
        `/app/studio/${service.recipeId}?service=${service.id}&draft=${id}`,
      );
    } catch (error) {
      notify((error as Error).message, true);
    } finally {
      setCatalogUpgradeBusy(false);
    }
  };
  return (
    <main className={`v2-studio v2-shell mobile-${mobile}`}>
      <div className="v2-studio-top">
        <div>
          <Link to="/app" className="v2-back">
            <ArrowLeft size={15} /> Pilih jasa
          </Link>
          <div className="v2-studio-title">
            <h1>{service.label}</h1>
            <span className="v2-tag">Racik visual</span>
          </div>
          <span className="v2-save-status" role="status">
            {saved}
          </span>
          {saved.startsWith("Gagal") && (
            <button
              className="v2-text-link"
              onClick={() => setSaveAttempt((n) => n + 1)}
            >
              Coba simpan lagi
            </button>
          )}
        </div>
        <div className="v2-studio-actions">
          <button
            className="button button-outline"
            onClick={() => {
              setPresetModal("apply");
              setSelectedPreset(null);
            }}
          >
            <Bookmark size={16} /> Gaya Tersimpan
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              setName(`${selectedSet.label} · Gayaku`);
              setPresetModal("save");
            }}
          >
            Simpan Gaya <Check size={16} />
          </button>
        </div>
      </div>
      {initial?.data.engineVersion === 2 &&
        Number(state.catalogVersion ?? initial.data.catalogVersion ?? 1) <
          CURRENT_CATALOG && (
          <aside
            className="v2-catalog-upgrade"
            aria-label="Katalog pilihan baru"
          >
            <div>
              <strong>Draft ini memakai katalog pilihan lama.</strong>
              <p>
                Salin ke katalog visual baru untuk mencoba lebih banyak contoh.
                Draft asli dan prompt manual tidak akan diubah.
              </p>
            </div>
            <button
              className="button button-outline"
              type="button"
              disabled={catalogUpgradeBusy}
              onClick={duplicateToCurrentCatalog}
            >
              {catalogUpgradeBusy
                ? "Membuat salinan…"
                : "Duplikasi ke katalog baru"}{" "}
              <ArrowRight size={15} />
            </button>
          </aside>
        )}
      <div
        className="v2-mobile-tabs"
        role="tablist"
        aria-label="Panel studio"
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          const next =
            event.key === "Home"
              ? "build"
              : event.key === "End"
                ? "prompt"
                : mobile === "build"
                  ? "prompt"
                  : "build";
          mobileTab(next);
          document.getElementById(`v2-${next}-tab`)?.focus();
        }}
      >
        <button
          role="tab"
          aria-selected={mobile === "build"}
          tabIndex={mobile === "build" ? 0 : -1}
          aria-controls="v2-build"
          id="v2-build-tab"
          onClick={() => mobileTab("build")}
        >
          Racik
        </button>
        <button
          role="tab"
          aria-selected={mobile === "prompt"}
          tabIndex={mobile === "prompt" ? 0 : -1}
          aria-controls="v2-prompt"
          id="v2-prompt-tab"
          onClick={() => mobileTab("prompt")}
        >
          Prompt {present.manual !== null ? "· manual" : ""}
        </button>
      </div>
      <div className="v2-studio-grid">
        <div
          className="v2-build-panel"
          id="v2-build"
          role="tabpanel"
          aria-labelledby="v2-build-tab"
        >
          <div className="v2-stage-nav" aria-label="Tahap racikan">
            {["Brief klien", "Racik tampilan", "Selesaikan"].map((label, i) => (
              <button
                key={label}
                aria-current={stage === i ? "step" : undefined}
                aria-label={`${i + 1} ${label}`}
                onClick={() => setStage(i)}
              >
                <span>
                  {i === 0 && state.brief.subject.trim() ? (
                    <Check size={14} />
                  ) : i === 1 && Object.keys(state.selections).length ? (
                    <Check size={14} />
                  ) : (
                    i + 1
                  )}
                </span>
                {label}
              </button>
            ))}
          </div>
          {stage === 0 && (
            <div className="v2-stage-content">
              <div className="v2-section-intro">
                <span className="v2-kicker">01 / BRIEF KLIEN</span>
                <h2>
                  Mulai dari kebutuhan.
                  <br />
                  Bukan istilah teknis.
                </h2>
                <p>
                  Brief asli dipertahankan persis. Boleh berbahasa Indonesia;
                  instruksi terstruktur tetap dalam Inggris.
                </p>
              </div>
              <div className="v2-current-set">
                <AssetImage
                  src={setImage(selectedSet.id)}
                  alt={`Contoh set ${selectedSet.label}`}
                  small
                />
                <div>
                  <span className="v2-kicker">SET AWAL</span>
                  <h3>{selectedSet.label}</h3>
                  <p>{selectedSet.description}</p>
                  <button className="v2-text-link" onClick={() => setStage(1)}>
                    Ubah pilihan set <ArrowRight size={15} />
                  </button>
                </div>
              </div>
              <div className="v2-brief-form">
                {briefFields.map(([key, label, placeholder]) => (
                  <label key={key}>
                    {label}
                    {key === "subject" && (
                      <span className="v2-optional">
                        {" "}
                        · gunakan contoh jika belum punya brief
                      </span>
                    )}
                    <textarea
                      aria-label={label}
                      rows={key === "subject" ? 3 : 2}
                      maxLength={
                        key === "brand"
                          ? 300
                          : key === "purpose" ||
                              key === "preserve" ||
                              key === "text"
                            ? 2000
                            : 3000
                      }
                      value={state.brief[key]}
                      placeholder={placeholder}
                      onChange={(e) =>
                        change({
                          state: {
                            ...state,
                            brief: { ...state.brief, [key]: e.target.value },
                          },
                        })
                      }
                    />
                    {key === "brand" && service.id === "branding" && (
                      <small>
                        Opsional. Jika dikosongkan, prompt tidak akan mengarang
                        nama atau inisial merek.
                      </small>
                    )}
                    {key === "text" && (
                      <small>
                        Ejaan dipertahankan. Rapikan teks di editor bila
                        generator tidak akurat.
                      </small>
                    )}
                  </label>
                ))}
                <button
                  className="v2-text-link"
                  onClick={() =>
                    change({
                      state: {
                        ...state,
                        brief: { ...state.brief, subject: selectedSet.subject },
                      },
                    })
                  }
                >
                  Gunakan subjek contoh set <ArrowRight size={15} />
                </button>
              </div>
              <div className="v2-reference-box">
                <h3>
                  {service.id === "branding"
                    ? "Sketsa / referensi di generator AI"
                    : "Foto referensi di generator AI"}
                </h3>
                <label>
                  Mode referensi
                  <select
                    value={state.referenceMode}
                    onChange={(e) =>
                      change({
                        state: {
                          ...state,
                          referenceMode: e.target
                            .value as StudioV2State["referenceMode"],
                        },
                      })
                    }
                  >
                    <option value="none">
                      {service.id === "branding"
                        ? "Konsep baru · tanpa referensi"
                        : "Visual baru · tanpa foto"}
                    </option>
                    {service.id === "prewedding" ? (
                      <>
                        <option value="couple">Satu foto pasangan</option>
                        <option value="individuals">
                          Dua foto individu · orang A & B
                        </option>
                      </>
                    ) : (
                      <option value="single">
                        {service.id === "branding"
                          ? "Satu sketsa / referensi"
                          : "Satu foto referensi"}
                      </option>
                    )}
                  </select>
                </label>
                <p>{descriptor?.referenceGuide ?? service.referenceGuide}</p>
                <small>
                  Jangan unggah foto klien di Aichemy. Lampirkan langsung pada
                  aplikasi gambar dengan izin yang sesuai.
                </small>
              </div>
            </div>
          )}
          {stage === 1 && (
            <div className="v2-stage-content">
              <div className="v2-section-intro">
                <span className="v2-kicker">PILIH, LIHAT, RACIK</span>
                <h2>Mulai dari contoh visual.</h2>
                <p>
                  Pilih satu gaya awal, lalu ubah bagian yang kamu mau. Setiap
                  gambar membantu kamu memilih. Hasil akhirnya dibuat di
                  aplikasi AI pilihanmu.
                </p>
              </div>
              <div className="v2-choices" aria-label="Pilihan racikan visual">
                <VisualChoices
                  field={setField}
                  value={state.setId}
                  onChange={(value) => {
                    const next = setOptions.find((s) => s.id === value);
                    if (next) {
                      change({ state: changeSet(state, next) });
                      notify(
                        `Gaya “${next.label}” diterapkan. Detail tambahan dan prompt manual tetap dijaga.`,
                      );
                    }
                  }}
                />
                <h3 className="v2-choice-section-title">Atur satu per satu</h3>
                <p className="v2-gallery-help v2-choice-section-help">
                  Ketuk gambar yang sedang dipakai untuk melihat contoh lainnya.
                </p>
              </div>
              <button
                className="v2-remix button button-outline"
                onClick={() => {
                  const candidates = setOptions.filter(
                    (s) => s.id !== state.setId,
                  );
                  const next =
                    candidates[Math.floor(Math.random() * candidates.length)];
                  change({ state: changeSet(state, next) });
                  notify(
                    `Gaya “${next.label}” dipakai. Detailmu tetap aman; perubahan bisa dibatalkan.`,
                  );
                }}
              >
                <Shuffle size={16} /> Acak Gaya <small>bisa dibatalkan</small>
              </button>
              <div className="v3-settings-toolbar">
                <label className="search-field">
                  <Search size={17} />
                  <input
                    type="search"
                    aria-label="Cari pengaturan racikan"
                    placeholder="Cari pakaian, tempat, cahaya…"
                    value={fieldQuery}
                    onChange={(e) => setFieldQuery(e.target.value)}
                  />
                </label>
                <div role="group" aria-label="Tampilkan pengaturan">
                  {(
                    [
                      ["all", "Semua"],
                      ["active", "Diatur"],
                      ["skipped", "Tidak diatur"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      aria-pressed={fieldFilter === value}
                      onClick={() => setFieldFilter(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p>
                  Atur yang kamu butuhkan saja. Pilih{" "}
                  <strong>Tanpa arahan tambahan</strong> untuk melewati bagian
                  lain.
                </p>
              </div>
              {descriptor?.fields
                .filter(
                  (f) =>
                    (!f.advanced || !!fieldQuery || fieldFilter !== "all") &&
                    matchesField(f),
                )
                .map((f) => (
                  <VisualChoices
                    key={f.key}
                    field={f}
                    value={
                      f.options.some(
                        (option) =>
                          option.value === state.selections[f.key] &&
                          !option.disabledReason,
                      )
                        ? state.selections[f.key]
                        : descriptor.state.selections[f.key]
                    }
                    onChange={(value) =>
                      change({
                        state: {
                          ...state,
                          selections: { ...state.selections, [f.key]: value },
                        },
                      })
                    }
                  />
                ))}
              {descriptor && !descriptor.fields.some(matchesField) && (
                <div className="v2-gallery-empty">
                  <p>Tidak ada pengaturan yang cocok.</p>
                  <button
                    type="button"
                    className="v2-text-link"
                    onClick={() => {
                      setFieldQuery("");
                      setFieldFilter("all");
                    }}
                  >
                    Tampilkan semua pengaturan
                  </button>
                </div>
              )}
              {descriptor?.fields.some((f) => f.advanced) &&
                !fieldQuery &&
                fieldFilter === "all" && (
                  <details className="v2-advanced">
                    <summary>
                      Pengaturan lanjutan <ChevronDown size={17} />
                    </summary>
                    {descriptor.fields
                      .filter((f) => f.advanced)
                      .map((f) => (
                        <VisualChoices
                          key={f.key}
                          field={f}
                          value={
                            f.options.some(
                              (option) =>
                                option.value === state.selections[f.key] &&
                                !option.disabledReason,
                            )
                              ? state.selections[f.key]
                              : descriptor.state.selections[f.key]
                          }
                          onChange={(value) =>
                            change({
                              state: {
                                ...state,
                                selections: {
                                  ...state.selections,
                                  [f.key]: value,
                                },
                              },
                            })
                          }
                        />
                      ))}
                  </details>
                )}
              <details className="v2-advanced v2-add-details">
                <summary>
                  Tambah detail <span>opsional</span> <ChevronDown size={17} />
                </summary>
                <p className="v2-field-help">
                  Racikan tetap bisa dipakai tanpa mengisi bagian ini.
                </p>
                <div className="v2-brief-form">
                  {briefFields.map(([key, label, placeholder]) => (
                    <label key={key}>
                      {label}
                      <textarea
                        aria-label={label}
                        rows={key === "subject" ? 3 : 2}
                        maxLength={
                          key === "brand"
                            ? 300
                            : key === "purpose" ||
                                key === "preserve" ||
                                key === "text"
                              ? 2000
                              : 3000
                        }
                        value={state.brief[key]}
                        placeholder={placeholder}
                        onChange={(event) =>
                          change({
                            state: {
                              ...state,
                              brief: {
                                ...state.brief,
                                [key]: event.target.value,
                              },
                            },
                          })
                        }
                      />
                      {key === "text" && (
                        <small>
                          Teks dipertahankan persis seperti yang kamu tulis.
                        </small>
                      )}
                    </label>
                  ))}
                </div>
              </details>
              <details className="v2-advanced v2-reference-details">
                <summary>
                  Gunakan foto sendiri <span>opsional</span>{" "}
                  <ChevronDown size={17} />
                </summary>
                <div className="v2-reference-box">
                  <label>
                    Foto referensi di aplikasi gambar
                    <select
                      value={state.referenceMode}
                      onChange={(event) =>
                        change({
                          state: {
                            ...state,
                            referenceMode: event.target
                              .value as StudioV2State["referenceMode"],
                          },
                        })
                      }
                    >
                      <option value="none">
                        Buat visual baru · tanpa foto
                      </option>
                      {service.id === "prewedding" ? (
                        <>
                          <option value="couple">Satu foto pasangan</option>
                          <option value="individuals">Dua foto individu</option>
                        </>
                      ) : (
                        <option value="single">Satu foto sendiri</option>
                      )}
                    </select>
                  </label>
                  <p>{descriptor?.referenceGuide ?? service.referenceGuide}</p>
                  <small>
                    Foto tidak diunggah atau disimpan di Aichemy. Lampirkan
                    langsung di generator gambar yang kamu pilih.
                  </small>
                </div>
              </details>
              <details className="v2-advanced v3-delivery-check">
                <summary>
                  Periksa sebelum dikirim <span>sesuai jasamu</span>
                  <ChevronDown size={17} />
                </summary>
                <p className="v2-field-help">
                  Setelah membuat gambar di aplikasi AI, cek bagian ini sebelum
                  menyerahkan hasil.
                </p>
                <div className="v2-qc">
                  {serviceChecklist(service.id).map((text) => (
                    <label key={text}>
                      <input type="checkbox" />
                      {text}
                    </label>
                  ))}
                </div>
              </details>
              <p className="v2-technical-note">
                Karakter lensa adalah ilustrasi AI, bukan simulasi optik
                terukur. Perspektif dipengaruhi jarak kamera.{" "}
                <a
                  href="https://files.canon-europe.com/files/webcontent/rf-lens-world/knowledge/perspective/index.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pelajari dasar perspektif ↗
                </a>
              </p>
            </div>
          )}
          {stage === 2 && (
            <div className="v2-stage-content">
              <div className="v2-section-intro">
                <span className="v2-kicker">03 / SELESAIKAN</span>
                <h2>
                  Prompt siap.
                  <br />
                  Kualitas tetap kamu yang jaga.
                </h2>
                <p>
                  Salin ke generator AI, lampirkan referensi sesuai panduan,
                  lalu periksa hasil sebelum menyerahkan ke klien.
                </p>
              </div>
              <div className="v2-final-summary">
                <h3>Ringkasan pilihan efektif</h3>
                <dl>
                  {descriptor?.fields.map((f) => (
                    <div key={f.key}>
                      <dt>{f.label}</dt>
                      <dd>
                        {
                          f.options.find(
                            (o) =>
                              o.value ===
                              (state.selections[f.key] ??
                                descriptor.state.selections[f.key]),
                          )?.label
                        }
                      </dd>
                    </div>
                  ))}
                </dl>
                <button className="v2-text-link" onClick={() => setStage(1)}>
                  Ubah tampilan <Pencil size={14} />
                </button>
              </div>
              <div className="v2-reference-box">
                <h3>Yang perlu kamu lampirkan</h3>
                <p>{descriptor?.referenceGuide}</p>
              </div>
              <div className="v2-qc">
                <h3>Checklist sebelum dikirim</h3>
                {serviceChecklist(service.id).map((text) => (
                  <label key={text}>
                    <input type="checkbox" />
                    {text}
                  </label>
                ))}
              </div>
              {service.id === "formal" && (
                <p className="v2-notice">
                  Bukan pengganti perekaman KTP-el dan tidak menjamin penerimaan
                  dokumen. Periksa persyaratan instansi tujuan.
                </p>
              )}
              <button
                className="button button-primary"
                onClick={copy}
                disabled={!canUsePrompt}
              >
                <Copy size={17} />
                {copied ? "Tersalin!" : "Salin prompt & gunakan"}
              </button>
            </div>
          )}
          <div className="v2-stage-footer">
            <button
              className="button button-outline"
              disabled={stage === 0}
              onClick={() => setStage((s) => s - 1)}
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <span>{stage + 1} dari 3 tahap</span>
            {stage < 2 ? (
              <button
                className="button button-primary"
                onClick={() => setStage((s) => s + 1)}
              >
                {stage === 0 ? "Racik tampilan" : "Periksa & selesaikan"}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="button button-outline"
                onClick={() => setPresetModal("save")}
              >
                Simpan gaya
              </button>
            )}
          </div>
        </div>
        <aside
          className="v2-prompt-panel"
          id="v2-prompt"
          role="tabpanel"
          aria-labelledby="v2-prompt-tab"
        >
          <div className="v2-prompt-sticky">
            <div className="v2-prompt-header">
              <div>
                <span className="v2-status-dot" />
                <strong>Prompt-mu</strong>
                <span className="v2-tag">
                  {present.manual === null ? "Otomatis" : "Suntingan manual"}
                </span>
              </div>
              <div>
                <button
                  className="icon-btn"
                  aria-label="Batalkan perubahan"
                  disabled={!history.past.length}
                  onClick={() => dispatch({ type: "undo" })}
                >
                  <Undo2 size={17} />
                </button>
                <button
                  className="icon-btn"
                  aria-label="Ulangi perubahan"
                  disabled={!history.future.length}
                  onClick={() => dispatch({ type: "redo" })}
                >
                  <Redo2 size={17} />
                </button>
              </div>
            </div>
            <div className="v2-prompt-mode">
              <span role="status">
                {present.manual !== null
                  ? "Tulisanmu aman · siap disalin"
                  : previewError
                    ? "Prompt belum diperbarui"
                    : busy
                      ? "Menyusun versi otomatis…"
                      : "Mengikuti pilihan visualmu"}
              </span>
              {present.manual === null ? (
                <button
                  onClick={() =>
                    change({ manual: descriptor?.document.text ?? "" })
                  }
                  disabled={!descriptor || busy || !!previewError}
                >
                  <Pencil size={13} /> Sunting
                </button>
              ) : (
                <button onClick={() => setResetManual(true)}>
                  Kembali ke otomatis
                </button>
              )}
            </div>
            {descriptor && (
              <EffectiveSummary
                choices={descriptor.effectiveChoices}
                set={descriptor.set.label}
              />
            )}
            {previewError && (
              <div className="v2-notice" role="alert">
                <span>{previewError}</span>
                <button
                  className="v2-text-link"
                  onClick={() => setPreviewRetry((n) => n + 1)}
                >
                  Coba lagi
                </button>
              </div>
            )}
            {descriptor?.issues.map((issue, i) => (
              <p
                key={`${issue.field}-${i}`}
                className={`v2-notice ${issue.level === "error" ? "v2-error" : ""}`}
                role={issue.level === "error" ? "alert" : undefined}
              >
                {issue.text}
              </p>
            ))}
            {present.manual !== null ? (
              <textarea
                className="v2-manual-text"
                value={present.manual}
                aria-label="Sunting prompt manual"
                onChange={(e) => change({ manual: e.target.value })}
              />
            ) : (
              <div
                className="v2-prompt-blocks"
                aria-busy={busy}
                tabIndex={0}
                role="region"
                aria-label="Blok prompt otomatis"
              >
                {descriptor?.document.blocks.map((b) => (
                  <section
                    key={b.id}
                    className={changed.includes(b.id) ? "block-changed" : ""}
                  >
                    <h3>{b.label}</h3>
                    <p>{b.text}</p>
                  </section>
                )) ?? <p>Menyusun blok prompt…</p>}
              </div>
            )}
            <div className="v2-prompt-tools">
              <button
                className="button button-primary"
                onClick={copy}
                disabled={!canUsePrompt}
              >
                <Copy size={17} />
                {copied ? "Tersalin!" : "Salin prompt"}
              </button>
              <button
                className="button button-outline"
                disabled={!canUsePrompt}
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([prompt], { type: "text/plain;charset=utf-8" }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `aichemy-${service.id}.txt`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                  notify("Prompt diekspor sebagai file teks.");
                }}
              >
                <Download size={16} /> Ekspor
              </button>
            </div>
            <p className="v2-prompt-footnote">
              {copied ? "Langkah berikutnya: " : "Setelah disalin: "}tempel
              prompt dan foto referensi di aplikasi gambar AI pilihanmu. Biaya
              aplikasi tersebut terpisah.
            </p>
          </div>
        </aside>
      </div>
      <div className="v2-mobile-copy">
        <span>
          {present.manual === null ? "Prompt otomatis" : "Suntingan manual"}
          <small>{saved}</small>
        </span>
        <button
          className="button button-primary"
          onClick={copy}
          disabled={!canUsePrompt}
        >
          <Copy size={16} />
          {copied ? "Tersalin!" : "Salin prompt"}
        </button>
      </div>
      {presetModal && (
        <Modal
          title={
            presetModal === "save" ? "Simpan gaya andalan" : "Pakai preset gaya"
          }
          wide
          onClose={() => {
            setPresetModal(null);
            setSelectedPreset(null);
          }}
        >
          {presetModal === "save" ? (
            <>
              <p>
                Simpan pilihan tampilannya untuk dipakai lagi. Detail klien,
                nama merek, teks iklan, dan tulisan manual tetap terpisah.
              </p>
              <label className="v2-preset-name">
                Nama gaya
                <input
                  value={name}
                  maxLength={120}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Profil bisnis — cahaya hangat"
                />
              </label>
              <div className="v2-preset-preview">
                <AssetImage
                  src={setImage(state.setId)}
                  alt="Ilustrasi set, bukan render racikan"
                  small
                />
                <div>
                  <strong>{service.label}</strong>
                  <p>
                    {descriptor?.fields
                      .map(
                        (f) =>
                          f.options.find(
                            (o) =>
                              o.value ===
                              (state.selections[f.key] ??
                                descriptor.state.selections[f.key]),
                          )?.label,
                      )
                      .join(" · ")}
                  </p>
                  <small>Ilustrasi set, bukan render racikan.</small>
                </div>
              </div>
              {previewError && (
                <p className="v2-notice">
                  Prompt otomatis belum diperbarui. Pilihan terbarumu tetap bisa
                  disimpan sebagai gaya.
                </p>
              )}
              <button
                className="button button-primary"
                disabled={!name.trim() || savingPreset}
                onClick={() => {
                  const existing = presets.find(
                    (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
                  );
                  if (existing) setOverwrite(existing);
                  else savePreset();
                }}
              >
                {savingPreset ? "Menyimpan…" : "Simpan gaya"}
              </button>
            </>
          ) : (
            <>
              <p>
                Pilih gaya lalu lihat perubahannya. Detail dan tulisan manualmu
                tidak diganti.
              </p>
              {presets.length ? (
                <div className="v2-preset-list">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      aria-pressed={selectedPreset?.id === p.id}
                      onClick={() => setSelectedPreset(p)}
                    >
                      <Bookmark size={17} />
                      <span>
                        {p.name}
                        <small>
                          {p.data.engineVersion === 2
                            ? "Gaya V2"
                            : "Preset V1 · tinjau pemetaan"}
                        </small>
                      </span>
                      {selectedPreset?.id === p.id && <Check size={16} />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Bookmark />
                  <h3>Belum ada gaya tersimpan.</h3>
                  <p>Simpan racikan pertamamu lewat Simpan Gaya.</p>
                </div>
              )}
              {selectedPreset && (
                <div className="v2-notice">
                  <strong>Pratinjau perubahan</strong>
                  <p>
                    {selectedPreset.data.engineVersion === 2
                      ? Object.entries(
                          (selectedPreset.data.state as StudioV2State)
                            .selections,
                        )
                          .map(([key, value]) => {
                            const f = descriptor?.fields.find(
                              (f) => f.key === key,
                            );
                            return f
                              ? `${f.label}: ${f.options.find((o) => o.value === value)?.label ?? `${value} (tidak tersedia)`}`
                              : `${key} (tidak tersedia)`;
                          })
                          .join(" · ")
                      : (() => {
                          const mapped = mapLegacyStyle(
                            (selectedPreset.data.state ?? {}) as Record<
                              string,
                              unknown
                            >,
                            state,
                            descriptor?.fields ?? [],
                          );
                          return `Hanya pilihan yang dikenali dan kompatibel akan diterapkan. ${mapped.unavailable.length ? `Tidak tersedia: ${mapped.unavailable.join(", ")}.` : "Semua pilihan gaya yang ditemukan memiliki padanan."} Data preset asli tidak diubah.`;
                        })()}
                  </p>
                  <p>
                    Detail, nama merek, teks iklan, dan tulisan manual: tetap.
                  </p>
                </div>
              )}
              <button
                className="button button-primary"
                disabled={!selectedPreset}
                onClick={applyPreset}
              >
                Pakai gaya ini
              </button>
            </>
          )}
        </Modal>
      )}
      {overwrite && (
        <Confirm
          title="Timpa gaya yang sudah ada?"
          action="Timpa gaya"
          description={`“${overwrite.name}” akan diganti dengan pilihan visual saat ini. Pilih batal dan ubah nama untuk membuat gaya baru.`}
          onClose={() => setOverwrite(null)}
          onConfirm={() => savePreset(overwrite)}
        />
      )}
      {resetManual && (
        <Confirm
          title="Kembali ke prompt otomatis?"
          action="Gunakan otomatis"
          description="Teks manual diganti dengan versi otomatis terbaru. Kamu masih dapat mengembalikannya lewat Undo selama sesi ini."
          onClose={() => setResetManual(false)}
          onConfirm={() => {
            change({ manual: null });
            setResetManual(false);
          }}
        />
      )}
    </main>
  );
}
