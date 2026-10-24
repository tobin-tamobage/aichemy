import React, { useEffect, useState, useReducer, useRef } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Heart,
  LayoutGrid,
  LogOut,
  Pencil,
  Plus,
  Redo2,
  Search,
  Settings2,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Undo2,
  UserRound,
} from "lucide-react";
import {
  LOOKS,
  findLook,
  PRICE_LABEL,
  type LibraryItem,
  type StudioDescriptor,
  type StudioField,
  type StudioState,
  type Order,
} from "../shared/product";
import { api, post } from "./api";
import { useSite } from "./context";
import {
  Brand,
  Confirm,
  ExampleImage,
  ImageTile,
  Modal,
  ThemeToggle,
} from "./ui";
import { Loading } from "./Access";
import { historyReducer, type Snapshot } from "./history";
import { CustomStudio } from "./StudioBuilder";
import { remixState } from "./remix";

export function MemberLayout() {
  const { user } = useSite();
  return (
    <div className="member-app">
      <header className="member-header">
        <div className="container member-nav">
          <Brand />
          <nav aria-label="Navigasi anggota">
            <NavLink to="/app" end>
              <LayoutGrid size={16} />
              Pilih Jasa
            </NavLink>
            <NavLink to="/app/viral">
              <Sparkles size={16} />
              Prompt Viral
            </NavLink>
            <NavLink to="/app/pustaka">
              <Bookmark size={16} />
              Pustaka Saya
            </NavLink>
            <NavLink to="/akun">
              <UserRound size={16} />
              Akun
            </NavLink>
          </nav>
          <div className="member-nav-end">
            <span className="member-lifetime">
              <Sparkles size={13} />
              {user?.active ? "Lifetime" : "Akun"}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
export function ExplorePage() {
  const { user, notify } = useSite();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [builder, setBuilder] = useState(false);
  const load = () =>
    api<{ items: LibraryItem[] }>("/library").then((r) => setItems(r.items));
  useEffect(() => {
    load().catch((e) => notify(e.message, true));
  }, []);
  const favorites = items
    .filter((i) => i.kind === "favorite")
    .map((i) => i.studioId);
  const recent = items.filter((i) => i.kind === "draft").slice(0, 3);
  async function favorite(id: string) {
    try {
      const item = items.find(
        (i) => i.kind === "favorite" && i.studioId === id,
      );
      if (item) await api(`/library/${item.id}`, { method: "DELETE" });
      else
        await api(`/library/${crypto.randomUUID()}`, {
          method: "PUT",
          body: JSON.stringify({
            kind: "favorite",
            studioId: id,
            name: findLook(id)?.label ?? id,
            data: {},
          }),
        });
      await load();
    } catch (e) {
      notify((e as Error).message, true);
    }
  }
  const visible = LOOKS.filter(
    (l) =>
      `${l.label} ${l.description}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter !== "favorites" || favorites.includes(l.id)),
  );
  return (
    <main className="container member-main">
      <div className="explore-welcome">
        <div>
          <div className="eyebrow">RUANG KREATIFMU SUDAH SIAP</div>
          <h1>
            Halo, {user?.name?.split(" ")[0] ?? "kreator"}
            <span className="purple-text">.</span>
            <br />
            Mau bikin apa hari ini?
          </h1>
          <p>
            Mulai dari tampilan yang kamu suka. Lalu buat jadi versimu sendiri.
          </p>
        </div>
        <div className="welcome-art">
          <span>✳</span>
          <div>
            Ide kecil,
            <br />
            <em>kemungkinan besar.</em>
          </div>
        </div>
      </div>
      {recent.length > 0 && (
        <section className="recent-section">
          <div className="row-heading">
            <h2>Lanjutkan racikanmu</h2>
            <Link to="/app/pustaka">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="recent-grid">
            {recent.map((item) => (
              <Link
                key={item.id}
                className="recent-card"
                to={`/app/studio/${item.studioId}?draft=${item.id}`}
              >
                <ExampleImage
                  id={findLook(item.studioId)?.id ?? "cinematic"}
                  alt=""
                />
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {new Date(item.updatedAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="studio-library">
        <div className="section-heading">
          <div>
            <div className="eyebrow">PILIH RUANG KREASIMU</div>
            <h2>Setiap ide punya studio.</h2>
          </div>
          <label className="search-field">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari studio atau inspirasi…"
              aria-label="Cari studio"
            />
          </label>
        </div>
        <div className="filter-row">
          <button
            className={`chip ${filter === "all" ? "selected" : ""}`}
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Semua studio
          </button>
          <button
            className={`chip ${filter === "favorites" ? "selected" : ""}`}
            aria-pressed={filter === "favorites"}
            onClick={() => setFilter("favorites")}
          >
            <Heart size={14} />
            Favorit
          </button>
          <button className="chip" onClick={() => setBuilder(true)}>
            <Plus size={14} />
            Buat Studio
          </button>
        </div>
        <div className="member-studio-grid">
          {visible.map((look) => (
            <article className="member-studio-card" key={look.id}>
              <Link to={`/app/studio/${look.id}?starter=1`}>
                <div className="member-studio-image">
                  <ExampleImage id={look.id} alt={look.title} />
                  <span className="gallery-category">{look.label}</span>
                </div>
                <div className="member-studio-caption">
                  <h3>{look.title}</h3>
                  <p>{look.description}</p>
                  <span>
                    Jadikan versimu <ArrowUpRight size={15} />
                  </span>
                </div>
              </Link>
              <button
                className={`favorite-btn ${favorites.includes(look.id) ? "is-favorite" : ""}`}
                aria-label={`${favorites.includes(look.id) ? "Hapus" : "Tambah"} favorit ${look.label}`}
                aria-pressed={favorites.includes(look.id)}
                onClick={() => favorite(look.id)}
              >
                <Heart
                  size={17}
                  fill={favorites.includes(look.id) ? "currentColor" : "none"}
                />
              </button>
            </article>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="empty-state">
            <Search size={30} />
            <h3>Belum ada studio di sini.</h3>
            <p>Coba kata lain atau tambahkan studio favoritmu.</p>
            <button
              className="button button-secondary"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Lihat Semua Studio
            </button>
          </div>
        )}
      </section>
      {items.some((i) => i.kind === "studio") && (
        <section className="custom-list">
          <h2>Studio buatanmu</h2>
          {items
            .filter((i) => i.kind === "studio")
            .map((i) => (
              <Link
                className="recent-card"
                to={`/app/studio/${i.studioId}`}
                key={i.id}
              >
                <div>
                  <strong>{i.name}</strong>
                  <span>Studio pribadi</span>
                </div>
                <ArrowUpRight />
              </Link>
            ))}
        </section>
      )}
      {builder && (
        <CustomStudio
          onClose={() => setBuilder(false)}
          onSaved={() => {
            setBuilder(false);
            load();
          }}
        />
      )}
    </main>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: StudioField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [picker, setPicker] = useState(false);
  const [query, setQuery] = useState("");
  const selected = Array.isArray(value)
    ? (value as string[])
    : value
      ? [String(value)]
      : [];
  const options = field.options ?? [];
  const multi = field.kind === "chips" || field.multi === true;
  const select = (v: string) => {
    if (multi) {
      if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
      else if (!field.max || selected.length < field.max)
        onChange([...selected, v]);
    } else {
      onChange(v);
      setPicker(false);
    }
  };
  const id = `studio-field-${field.key}`;
  if (field.kind === "toggle")
    return (
      <label className="toggle-field">
        <input
          type="checkbox"
          role="switch"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="switch-track" />
        <span>
          {field.label}
          {field.hint && <small>{field.hint}</small>}
        </span>
      </label>
    );
  if (field.kind === "textarea")
    return (
      <label className="studio-text-field" htmlFor={id}>
        <span>{field.label}</span>
        <textarea
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          maxLength={6000}
        />
        <small>
          Jelaskan subjek dan suasananya. Untuk hasil sepenuhnya Inggris, tulis
          deskripsi dalam bahasa Inggris. Tulisanmu dipertahankan apa adanya.
        </small>
      </label>
    );
  if (field.kind === "select")
    return (
      <label className="studio-text-field" htmlFor={id}>
        <span>{field.label}</span>
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Pilih {field.label.toLowerCase()}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  const shown = [
    ...options.filter((o) => selected.includes(o.value)),
    ...options.filter((o) => !selected.includes(o.value)),
  ].slice(0, 4);
  return (
    <div className="visual-field">
      <div className="visual-field-heading">
        <label id={`${id}-label`}>
          {field.label}
          {multi && (
            <small>
              {" "}
              · {selected.length}
              {field.max ? `/${field.max}` : ""} dipilih
            </small>
          )}
        </label>
        <button
          className="text-button"
          onClick={() => {
            setQuery("");
            setPicker(true);
          }}
        >
          Lihat semua <ArrowUpRight size={13} />
        </button>
      </div>
      <div
        className={`inline-options ${field.kind === "chips" ? "text-options" : ""}`}
        role="group"
        aria-labelledby={`${id}-label`}
      >
        {shown.map((option) => (
          <button
            key={option.value}
            className={`option-tile ${selected.includes(option.value) ? "chosen" : ""}`}
            aria-pressed={selected.includes(option.value)}
            onClick={() => select(option.value)}
            disabled={
              multi &&
              Boolean(field.max) &&
              selected.length >= field.max! &&
              !selected.includes(option.value)
            }
          >
            {field.kind !== "chips" && (
              <ImageTile
                src={option.image}
                label={option.label}
                group={field.key}
              />
            )}
            <span>{option.label}</span>
            {selected.includes(option.value) && (
              <i>
                <Check size={12} />
              </i>
            )}
          </button>
        ))}
      </div>
      {field.hint && <small className="muted">{field.hint}</small>}
      {picker && (
        <Modal
          title={`Pilih ${field.label.toLowerCase()}`}
          onClose={() => setPicker(false)}
          wide
        >
          <div className="picker-toolbar">
            <label className="search-field">
              <Search size={16} />
              <input
                autoFocus
                aria-label={`Cari ${field.label}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari pilihan…"
              />
            </label>
            <button
              className="text-button"
              onClick={() => onChange(multi ? [] : "")}
            >
              Kosongkan
            </button>
          </div>
          <div className="picker-grid">
            {options
              .filter((o) =>
                o.label.toLowerCase().includes(query.toLowerCase()),
              )
              .map((o) => (
                <button
                  key={o.value}
                  className={`option-tile ${selected.includes(o.value) ? "chosen" : ""}`}
                  aria-pressed={selected.includes(o.value)}
                  disabled={
                    multi &&
                    Boolean(field.max) &&
                    selected.length >= field.max! &&
                    !selected.includes(o.value)
                  }
                  onClick={() => select(o.value)}
                >
                  <ImageTile src={o.image} label={o.label} group={field.key} />
                  <span>{o.label}</span>
                  {o.hint && <small>{o.hint}</small>}
                  {selected.includes(o.value) && (
                    <i>
                      <Check size={13} />
                    </i>
                  )}
                </button>
              ))}
          </div>
          {!options.some((o) =>
            o.label.toLowerCase().includes(query.toLowerCase()),
          ) && <div className="empty-state">Tidak ada pilihan yang cocok.</div>}
          {multi && (
            <button
              className="button button-primary full-width"
              onClick={() => setPicker(false)}
            >
              Selesai Memilih <Check size={16} />
            </button>
          )}
        </Modal>
      )}
    </div>
  );
}

export function StudioPage() {
  const { id = "cinematic" } = useParams();
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const { notify } = useSite();
  const [descriptor, setDescriptor] = useState<StudioDescriptor | null>(null);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("describe");
  const [mobileTab, setMobileTab] = useState("build");
  const [advanced, setAdvanced] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState("");
  const [pending, setPending] = useState(false);
  const [modal, setModal] = useState<"save" | "presets" | "duplicate" | null>(
    null,
  );
  const [presetName, setPresetName] = useState("");
  const [overwrite, setOverwrite] = useState<LibraryItem | null>(null);
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: { state: {}, manual: null },
    future: [],
  });
  const draftId = useRef<string>(crypto.randomUUID());
  const ready = useRef(false);
  const lastSaved = useRef("");
  const previewSequence = useRef(0);
  const buildScroll = useRef(0);
  const previewScroll = useRef(0);
  const loadedDraft = useRef<{ studio: string; id: string } | null>(null);
  const queuedSave = useRef<Promise<unknown>>(Promise.resolve());
  const saveCandidate = useRef<{
    id: string;
    body: string;
    value: string;
  } | null>(null);
  const snapshot = history.present;
  const finalPrompt = snapshot.manual ?? descriptor?.prompt ?? "";
  useEffect(() => {
    if (
      loadedDraft.current?.studio === id &&
      query.get("draft") === loadedDraft.current.id
    ) {
      ready.current = true;
      return;
    }
    let cancelled = false;
    ready.current = false;
    setDescriptor(null);
    setError("");
    setStage("describe");
    setMobileTab("build");
    (async () => {
      const library = await api<{ items: LibraryItem[] }>("/library");
      const draft = query.get("starter")
        ? undefined
        : library.items.find(
            (i) =>
              i.kind === "draft" &&
              i.studioId === id &&
              (!query.get("draft") || i.id === query.get("draft")),
          );
      const result = await post<StudioDescriptor>(`/studios/${id}/preview`, {
        state: draft?.data.state ?? {},
        starter: query.get("starter") === "1",
      });
      if (cancelled) return;
      setItems(library.items);
      setDescriptor(result);
      draftId.current = draft?.id ?? crypto.randomUUID();
      loadedDraft.current = { studio: id, id: draftId.current };
      dispatch({
        type: "replace",
        value: {
          state: result.state,
          manual:
            typeof draft?.data.manual === "string" ? draft.data.manual : null,
        },
      });
      lastSaved.current = draft
        ? JSON.stringify({
            state: result.state,
            manual: draft.data.manual ?? null,
          })
        : "";
      ready.current = true;
    })().catch((e) => {
      if (!cancelled) setError(e.message);
    });
    return () => {
      cancelled = true;
      ready.current = false;
    };
  }, [id, query.toString()]);
  useEffect(() => {
    if (!ready.current) return;
    const controller = new AbortController();
    const sequence = ++previewSequence.current;
    const timer = setTimeout(() => {
      setPending(true);
      post<StudioDescriptor>(`/studios/${id}/preview`, {
        state: snapshot.state,
      })
        .then((result) => {
          if (
            !controller.signal.aborted &&
            sequence === previewSequence.current
          ) {
            setDescriptor(result);
            setError("");
          }
        })
        .catch((e) => {
          if (!controller.signal.aborted) setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setPending(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [snapshot.state, id]);
  useEffect(() => {
    if (!ready.current || !descriptor) return;
    const value = JSON.stringify(snapshot);
    if (value === lastSaved.current) return;
    const candidate = {
      id: draftId.current,
      value,
      body: JSON.stringify({
        kind: "draft",
        studioId: id,
        name: `Racikan ${descriptor.label}`,
        data: snapshot,
      }),
    };
    saveCandidate.current = candidate;
    let cancelled = false;
    setSaved("Menyimpan…");
    const timer = setTimeout(() => {
      queuedSave.current = queuedSave.current
        .catch(() => {})
        .then(() =>
          api(`/library/${candidate.id}`, {
            method: "PUT",
            body: candidate.body,
          }),
        )
        .then(() => {
          if (cancelled) return;
          lastSaved.current = value;
          saveCandidate.current = null;
          setSaved("Tersimpan di akun");
          if (query.get("draft") !== candidate.id)
            navigate(`/app/studio/${id}?draft=${candidate.id}`, {
              replace: true,
            });
        })
        .catch((e) => {
          setSaved("Belum tersimpan");
          notify(e.message, true);
        });
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [snapshot, descriptor?.label, id]);
  useEffect(() => {
    const flush = () => {
      const candidate = saveCandidate.current;
      if (!candidate || candidate.value === lastSaved.current) return;
      queuedSave.current = queuedSave.current
        .catch(() => {})
        .then(() =>
          api(`/library/${candidate.id}`, {
            method: "PUT",
            body: candidate.body,
            keepalive: true,
          }),
        )
        .catch(() => {});
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);
  const change = (state: StudioState) =>
    dispatch({ type: "change", value: { ...snapshot, state } });
  async function copy() {
    try {
      await navigator.clipboard.writeText(finalPrompt);
      notify("Prompt berhasil disalin. Saatnya berkreasi!");
    } catch {
      notify(
        "Clipboard belum tersedia. Seleksi dan salin teks prompt secara manual.",
        true,
      );
    }
  }
  function remix() {
    if (!descriptor) return;
    change(
      remixState(descriptor, snapshot.state, Math.floor(Math.random() * 3)),
    );
    notify("Tampilan diracik ulang. Deskripsimu tetap tersimpan.");
  }
  async function savePreset(existing?: LibraryItem) {
    const name = presetName.trim();
    if (!name || !descriptor) return;
    const duplicate = items.find(
      (i) =>
        i.kind === "preset" &&
        i.studioId === id &&
        i.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate && !existing) {
      setOverwrite(duplicate);
      return;
    }
    const data = Object.fromEntries(
      Object.entries(snapshot.state).filter(
        ([key]) => !descriptor.protectedKeys.includes(key),
      ),
    );
    try {
      await api(`/library/${existing?.id ?? crypto.randomUUID()}`, {
        method: "PUT",
        body: JSON.stringify({
          kind: "preset",
          studioId: id,
          name,
          data: { state: data },
        }),
      });
      setItems((await api<{ items: LibraryItem[] }>("/library")).items);
      setModal(null);
      setOverwrite(null);
      notify("Gaya berhasil disimpan.");
    } catch (e) {
      notify((e as Error).message, true);
    }
  }
  function switchTab(next: string) {
    if (mobileTab === "build") buildScroll.current = window.scrollY;
    else previewScroll.current = window.scrollY;
    setMobileTab(next);
    requestAnimationFrame(() =>
      window.scrollTo(
        0,
        next === "build" ? buildScroll.current : previewScroll.current,
      ),
    );
  }
  if (!descriptor)
    return error ? (
      <div className="container empty-state">
        <h1>Studio belum dapat dibuka.</h1>
        <p role="alert">{error}</p>
        <Link className="button button-primary" to="/app">
          Kembali ke Jelajahi
        </Link>
      </div>
    ) : (
      <Loading />
    );
  const presets = [
    ...items.filter((i) => i.kind === "preset" && i.studioId === id),
    ...(descriptor?.presets ?? []).map((preset) => ({
      id: `builtin-${preset.id}`,
      name: preset.name,
      data: { state: preset.state },
    })),
  ];
  return (
    <main className="studio-page container">
      <div className="studio-topline">
        <Link to="/app" className="back-link">
          <ArrowLeft size={15} />
          Semua studio
        </Link>
        <span className="save-indicator">
          <span />
          {saved || "Draft pribadi"}
        </span>
      </div>
      <div className="studio-page-heading">
        <div>
          <div className="eyebrow">STUDIO {descriptor.label.toUpperCase()}</div>
          <h1>
            Jadikan idemu <em>terlihat.</em>
          </h1>
        </div>
        <div className="studio-heading-actions">
          <button
            className="button button-secondary"
            onClick={() => setModal("presets")}
          >
            <Bookmark size={15} />
            Pakai Preset
          </button>
          <button className="button button-secondary" onClick={remix}>
            <Shuffle size={16} />
            Acak Gaya
          </button>
          <button
            className="icon-btn"
            aria-label="Batalkan perubahan"
            disabled={!history.past.length}
            onClick={() => dispatch({ type: "undo" })}
          >
            <Undo2 size={18} />
          </button>
          <button
            className="icon-btn"
            aria-label="Ulangi perubahan"
            disabled={!history.future.length}
            onClick={() => dispatch({ type: "redo" })}
          >
            <Redo2 size={18} />
          </button>
        </div>
      </div>
      <nav className="stage-nav" aria-label="Tahap meracik prompt">
        {[
          ["describe", "01", "Deskripsikan"],
          ["shape", "02", "Atur Tampilan"],
          ["finish", "03", "Selesaikan"],
        ].map(([value, number, label]) => (
          <button
            key={value}
            className={stage === value ? "active" : ""}
            aria-current={stage === value ? "step" : undefined}
            onClick={() => {
              setStage(value);
              if (value === "finish") switchTab("preview");
              else switchTab("build");
            }}
          >
            <span>
              {["describe", "shape", "finish"].indexOf(stage) >
              ["describe", "shape", "finish"].indexOf(value) ? (
                <Check size={13} />
              ) : (
                number
              )}
            </span>
            {label}
            <ArrowRight size={15} />
          </button>
        ))}
      </nav>
      <div className="mobile-studio-tabs">
        <button
          className={mobileTab === "build" ? "active" : ""}
          onClick={() => switchTab("build")}
        >
          Racik
        </button>
        <button
          className={mobileTab === "preview" ? "active" : ""}
          onClick={() => switchTab("preview")}
        >
          Pratinjau
        </button>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className={`studio-workspace mobile-${mobileTab}`}>
        <section className="builder-pane" aria-label="Pilihan visual">
          <div className="builder-intro">
            <span className="pill">
              <Sparkles size={12} />
              {stage === "describe"
                ? "MULAI DARI IDEMU"
                : stage === "finish"
                  ? "SIAP DIBAWA KE APLIKASI GAMBAR"
                  : "BEBAS BEREKSPLORASI"}
            </span>
            <h2>
              {stage === "describe"
                ? "Apa yang kamu bayangkan?"
                : stage === "finish"
                  ? "Racikanmu sudah siap."
                  : "Berikan sentuhan khasmu."}
            </h2>
            <p>
              Setiap pilihan membantu mengarahkan visual. Kamu tidak perlu
              mengisi semuanya.
            </p>
          </div>
          {descriptor.referencePhoto && stage === "describe" && (
            <div className="control-section">
              <FieldControl
                field={{
                  key: "hasReferencePhoto",
                  kind: "toggle",
                  label: "Gunakan foto referensi",
                  visible: true,
                  hint: "Tambahkan foto referensi langsung di aplikasi pembuat gambar saat memakai prompt. Foto tidak diunggah ke Aichemy.",
                }}
                value={snapshot.state.hasReferencePhoto}
                onChange={(value) =>
                  change({ ...snapshot.state, hasReferencePhoto: value })
                }
              />
            </div>
          )}
          {stage === "finish" && (
            <section className="control-section finish-summary">
              <h3>Detail yang kamu pilih</h3>
              <dl>
                {descriptor.sections
                  .flatMap((section) => section.fields)
                  .filter(
                    (field) =>
                      field.visible &&
                      snapshot.state[field.key] &&
                      (!Array.isArray(snapshot.state[field.key]) ||
                        (snapshot.state[field.key] as unknown[]).length),
                  )
                  .slice(0, 10)
                  .map((field) => {
                    const value = snapshot.state[field.key];
                    const values = Array.isArray(value) ? value : [value];
                    return (
                      <div key={field.key}>
                        <dt>{field.label}</dt>
                        <dd>
                          {field.kind === "toggle"
                            ? "Aktif"
                            : values
                                .map(
                                  (v) =>
                                    field.options?.find(
                                      (option) => option.value === v,
                                    )?.label ?? String(v),
                                )
                                .join(", ")}
                        </dd>
                      </div>
                    );
                  })}
              </dl>
              <p className="muted">
                Salin prompt atau unduh sebagai .txt, lalu gunakan di aplikasi
                gambar pilihanmu. Aichemy tidak membuat gambar.
              </p>
              <button
                className="button button-secondary"
                onClick={() => {
                  setStage("shape");
                  switchTab("build");
                }}
              >
                Kembali meracik <Pencil size={15} />
              </button>
            </section>
          )}
          {stage !== "finish" &&
            descriptor.sections
              .filter((section) =>
                stage === "describe" ? section.stage === "describe" : true,
              )
              .map((section) => {
                const visible = section.fields.filter(
                  (f) => f.visible && (!f.advanced || advanced),
                );
                if (!visible.length) return null;
                return (
                  <section className="control-section" key={section.id}>
                    <h3>{section.title}</h3>
                    <small className="section-progress">
                      {
                        visible.filter((field) => {
                          const value = snapshot.state[field.key];
                          return Array.isArray(value)
                            ? value.length > 0
                            : typeof value === "boolean" || Boolean(value);
                        }).length
                      }{" "}
                      dari {visible.length} pilihan terisi · tidak wajib semua
                    </small>
                    <div className="control-fields">
                      {visible.map((field) => (
                        <FieldControl
                          key={field.key}
                          field={field}
                          value={snapshot.state[field.key]}
                          onChange={(value) =>
                            change({ ...snapshot.state, [field.key]: value })
                          }
                        />
                      ))}
                    </div>
                    {descriptor.warnings
                      .filter((w) => w.sectionId === section.id)
                      .map((w, i) => (
                        <p
                          className={`field-note ${w.level === "warn" ? "warning" : ""}`}
                          key={i}
                        >
                          {w.text}
                        </p>
                      ))}
                  </section>
                );
              })}
          {stage !== "finish" && (
            <button
              className="advanced-toggle"
              aria-expanded={advanced}
              onClick={() => {
                setAdvanced(!advanced);
                if (!advanced) setStage("shape");
              }}
            >
              <Settings2 size={16} />
              Pengaturan lanjutan
              <ChevronDown className={advanced ? "rotated" : ""} size={17} />
            </button>
          )}
          {stage !== "finish" && (
            <div className="builder-footer">
              <span>Sudah punya arah? Prompt siap digunakan.</span>
              <button
                className="button button-primary"
                onClick={() => {
                  setStage(stage === "describe" ? "shape" : "finish");
                  if (stage !== "describe") switchTab("preview");
                }}
              >
                {" "}
                {stage === "describe" ? "Atur Tampilannya" : "Tinjau Prompt"}
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </section>
        <aside className="preview-pane" aria-label="Pratinjau prompt">
          <div className="prompt-sheet">
            <div className="prompt-sheet-heading">
              <div className="eyebrow">
                <Sparkles size={13} />
                RACIKANMU
              </div>
              <span className={`status-pill ${pending ? "updating" : ""}`}>
                {snapshot.manual !== null
                  ? "Disunting olehmu"
                  : pending
                    ? "Memperbarui…"
                    : "Draf otomatis"}
              </span>
            </div>
            <h2>
              Prompt kamu<span className="purple-text">.</span>
            </h2>
            <p className="prompt-subtitle">
              Satu ide, dengan arah yang lebih jelas.
            </p>
            <div className="prompt-tools">
              <button
                className="text-button"
                onClick={() => setEditing(!editing)}
              >
                <Pencil size={14} />
                {editing ? "Selesai menyunting" : "Sunting"}
              </button>
              <button
                className="text-button"
                onClick={() => {
                  const blob = new Blob([finalPrompt], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `aichemy-${id}.txt`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                  notify("Unduhan prompt dimulai.");
                }}
              >
                <Download size={14} />
                Unduh .txt
              </button>
              <span>ENGLISH</span>
            </div>
            {snapshot.manual !== null && (
              <div className="manual-note">
                Suntinganmu aman. Pilihan visual memperbarui versi otomatis.
                <button
                  onClick={() =>
                    dispatch({
                      type: "change",
                      value: { ...snapshot, manual: null },
                    })
                  }
                >
                  Gunakan versi otomatis
                </button>
              </div>
            )}
            {editing ? (
              <textarea
                className="manual-prompt"
                aria-label="Sunting prompt bahasa Inggris"
                value={finalPrompt}
                onChange={(e) =>
                  dispatch({
                    type: "change",
                    value: { ...snapshot, manual: e.target.value },
                  })
                }
                rows={12}
                maxLength={20000}
              />
            ) : (
              <div
                className={`prompt-document ${pending ? "is-updating" : ""}`}
                tabIndex={0}
              >
                {finalPrompt.split(/\n\n+/).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
            <div className="prompt-sheet-actions">
              <button
                className="button button-primary"
                onClick={copy}
                disabled={!finalPrompt || pending}
              >
                <Copy size={16} />
                Salin Prompt
              </button>
              <button
                className="icon-btn"
                aria-label="Simpan gaya sebagai preset"
                onClick={() => {
                  setPresetName("");
                  setModal("save");
                }}
              >
                <Bookmark size={18} />
              </button>
            </div>
            <div className="prompt-footer-note">
              <CheckCircle2 size={14} />
              Siap ditempel ke aplikasi gambar pilihanmu.
            </div>
          </div>
          <div className="prompt-next">
            <div className="round-icon">
              <ArrowUpRight size={18} />
            </div>
            <div>
              <strong>Langkah berikutnya?</strong>
              <p>
                Tempel di GPT Image, Nano Banana, atau generator favoritmu.
                Aichemy tidak membuat gambar.
              </p>
            </div>
          </div>
          <button
            className="text-button duplicate-studio"
            onClick={() => setModal("duplicate")}
          >
            <Plus size={15} />
            Duplikat sebagai studio pribadi
          </button>
        </aside>
      </div>
      <div className="mobile-copy-bar">
        <span>
          {descriptor.label}
          <small>{saved || "Racikanmu tersimpan otomatis"}</small>
        </span>
        <button
          className="button button-primary"
          onClick={copy}
          disabled={pending}
        >
          <Copy size={16} />
          Salin Prompt
        </button>
      </div>
      {modal === "save" && (
        <Modal title="Simpan gaya andalanmu" onClose={() => setModal(null)}>
          <p className="muted">
            Pengaturan visual disimpan. Deskripsi pribadi tetap dipertahankan
            saat preset dipakai.
          </p>
          <label className="form-label">
            Nama gaya
            <input
              autoFocus
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              maxLength={120}
              placeholder="Misalnya: Produk cahaya pagi"
            />
          </label>
          <button
            className="button button-primary full-width"
            disabled={!presetName.trim()}
            onClick={() => savePreset()}
          >
            Simpan Gaya <Bookmark size={16} />
          </button>
        </Modal>
      )}
      {overwrite && (
        <Confirm
          title="Ganti preset yang sudah ada?"
          description={`Preset “${overwrite.name}” akan diganti dengan pilihan visual saat ini.`}
          action="Ganti Preset"
          onClose={() => setOverwrite(null)}
          onConfirm={() => savePreset(overwrite)}
        />
      )}
      {modal === "presets" && (
        <Modal title="Pilih gaya tersimpan" onClose={() => setModal(null)}>
          <p className="muted">
            Deskripsi dan suntingan manualmu tetap dipertahankan. Perubahan
            dapat dibatalkan dengan Undo.
          </p>
          {presets.length ? (
            presets.map((preset) => (
              <div className="preset-row" key={preset.id}>
                <div>
                  <strong>{preset.name}</strong>
                  <small>
                    {Object.keys((preset.data.state as object) ?? {}).length}{" "}
                    pengaturan visual
                  </small>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() => {
                    const next = { ...snapshot.state };
                    for (const [key, value] of Object.entries(
                      (preset.data.state ?? {}) as StudioState,
                    ))
                      if (!descriptor.protectedKeys.includes(key))
                        next[key] = value;
                    change(next);
                    setModal(null);
                    notify("Preset diterapkan. Deskripsimu tetap aman.");
                  }}
                >
                  Pakai
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Bookmark />
              <h3>Belum ada preset di studio ini.</h3>
              <p>
                Setelah menemukan gaya yang pas, simpan melalui ikon bookmark.
              </p>
            </div>
          )}
        </Modal>
      )}
      {modal === "duplicate" && (
        <CustomStudio
          sourceId={id}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            notify("Studio pribadi tersimpan. Buka dari Pustaka Saya.");
          }}
        />
      )}
    </main>
  );
}
