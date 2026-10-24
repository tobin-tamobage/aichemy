import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Bookmark,
  Download,
  Heart,
  Import,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type { LibraryItem } from "../shared/product";
import { LOOKS, findLook } from "../shared/product";
import { api } from "./api";
import { useSite } from "./context";
import { Confirm, ExampleImage, Modal } from "./ui";
import { CustomStudio } from "./StudioBuilder";
import { setImage, findService } from "../shared/v2-catalog";
import { AssetImage } from "./V2Visuals";
import type { StudioV2State } from "../shared/v2";
export default function LibraryPage() {
  const { user, notify } = useSite();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filter, setFilter] = useState("draft");
  const [query, setQuery] = useState("");
  const [remove, setRemove] = useState<LibraryItem | null>(null);
  const [editing, setEditing] = useState<LibraryItem | "new" | null>(null);
  const [importing, setImporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [legacy, setLegacy] = useState<
    {
      name: string;
      studioId: string;
      kind: "preset" | "studio" | "favorite";
      data: Record<string, unknown>;
    }[]
  >([]);
  const load = () =>
    api<{ items: LibraryItem[] }>("/library").then((r) => setItems(r.items));
  useEffect(() => {
    load().catch((e) => notify(e.message, true));
    const data: typeof legacy = [];
    for (const look of LOOKS) {
      try {
        const raw =
          localStorage.getItem(`aichemy-presets-${look.id}`) ??
          (look.id === "cinematic"
            ? localStorage.getItem("renderzero_user_presets_v1")
            : null);
        if (!raw) continue;
        const presets: unknown = JSON.parse(raw);
        if (Array.isArray(presets))
          for (const p of presets.slice(0, 100))
            if (
              p &&
              typeof p.name === "string" &&
              p.data &&
              typeof p.data === "object"
            )
              data.push({
                name: p.name,
                studioId: look.id,
                kind: "preset",
                data: { state: p.data },
              });
      } catch {}
    }
    try {
      const studios: unknown = JSON.parse(
        localStorage.getItem("aichemy-custom-studios") ?? "[]",
      );
      if (Array.isArray(studios))
        for (const studio of studios.slice(0, 100)) {
          if (
            studio &&
            typeof studio.id === "string" &&
            typeof studio.label === "string" &&
            Array.isArray(studio.sections)
          ) {
            data.unshift({
              name: studio.label,
              studioId: studio.id,
              kind: "studio",
              data: { recipe: studio },
            });
            const presets: unknown = JSON.parse(
              localStorage.getItem(`aichemy-presets-${studio.id}`) ?? "[]",
            );
            if (Array.isArray(presets))
              for (const preset of presets.slice(0, 100))
                if (preset?.name && preset?.data)
                  data.push({
                    name: preset.name,
                    studioId: studio.id,
                    kind: "preset",
                    data: { state: preset.data },
                  });
          }
        }
      const favorites: unknown = JSON.parse(
        localStorage.getItem("aichemy-favorite-studios-v1") ?? "[]",
      );
      if (Array.isArray(favorites))
        for (const id of favorites)
          if (typeof id === "string" && findLook(id))
            data.push({
              name: findLook(id)!.label,
              studioId: id,
              kind: "favorite",
              data: {},
            });
    } catch {}
    setLegacy(data);
  }, []);
  const visible = items.filter(
    (i) =>
      i.kind === filter && i.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="container member-main">
      <div className="section-heading library-heading">
        <div>
          <div className="eyebrow">IDE BAGUS LAYAK DISIMPAN</div>
          <h1>
            Pustaka <em>kreatifmu.</em>
          </h1>
          <p>Lanjutkan draft, simpan gaya, dan bangun studio versimu.</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setEditing("new")}
        >
          <Plus size={16} />
          Buat Studio
        </button>
      </div>
      {legacy.length > 0 &&
        !localStorage.getItem(`aichemy-imported-${user?.id}`) && (
          <div className="import-banner">
            <div>
              <strong>Ada {legacy.length} item dari versi sebelumnya.</strong>
              <p>
                Impor preset, favorit, dan studio pribadi ke akun ini. Data lama
                tetap disimpan di browser.
              </p>
            </div>
            <button
              className="button button-secondary"
              onClick={() => setImporting(true)}
            >
              <Import size={16} />
              Tinjau Impor
            </button>
          </div>
        )}
      <div className="library-toolbar">
        <div className="filter-row">
          {[
            ["draft", "Draft"],
            ["preset", "Preset"],
            ["favorite", "Favorit"],
            ["studio", "Studio Pribadi"],
          ].map(([value, label]) => (
            <button
              className={`chip ${filter === value ? "selected" : ""}`}
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
              <span>{items.filter((i) => i.kind === value).length}</span>
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Cari di pustaka"
            placeholder="Cari racikanmu…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {visible.length ? (
        <div className="library-grid">
          {visible.map((item) => (
            <article key={item.id} className="library-card">
              {item.data.engineVersion === 2 ? (
                <AssetImage
                  src={setImage((item.data.state as StudioV2State).setId)}
                  alt=""
                  small
                />
              ) : (
                <ExampleImage
                  id={findLook(item.studioId)?.id ?? "cinematic"}
                  alt=""
                />
              )}
              <div className="library-card-body">
                <span className="eyebrow">
                  {findService(
                    String(
                      item.data.serviceId ??
                        (item.data.state as StudioV2State)?.serviceId ??
                        "",
                    ),
                  )?.label ??
                    findLook(item.studioId)?.label ??
                    "Studio Pribadi"}
                </span>
                <h3>{item.name}</h3>
                <small>
                  {new Date(item.updatedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </small>
                <div className="library-card-actions">
                  {item.kind === "studio" ? (
                    <button
                      className="text-button"
                      onClick={() => setEditing(item)}
                    >
                      <Pencil size={14} />
                      Sunting
                    </button>
                  ) : (
                    <Link
                      className="text-button"
                      to={`/app/studio/${item.studioId}${item.kind === "draft" ? `?draft=${item.id}` : item.data.serviceId ? `?service=${item.data.serviceId}&starter=1` : item.data.engineVersion === 2 ? `?service=${(item.data.state as StudioV2State).serviceId}&starter=1` : ""}`}
                    >
                      Buka Studio <ArrowUpRight size={14} />
                    </Link>
                  )}
                  {item.kind === "studio" && (
                    <Link
                      className="text-button"
                      to={`/app/studio/${item.studioId}`}
                    >
                      Buka <ArrowUpRight size={14} />
                    </Link>
                  )}
                  <button
                    className="icon-btn danger-text"
                    aria-label={`Hapus ${item.name}`}
                    onClick={() => setRemove(item)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state library-empty">
          <Bookmark size={35} />
          <h2>Tempat untuk ide berikutnya.</h2>
          <p>
            {query
              ? "Tidak ada hasil yang cocok. Coba kata lain."
              : "Mulai meracik dari sebuah studio. Simpan gaya favoritmu, lalu temukan kembali di sini."}
          </p>
          <Link className="button button-primary" to="/app">
            Jelajahi Studio <ArrowUpRight size={17} />
          </Link>
        </div>
      )}
      {remove && (
        <Confirm
          title={`Hapus ${remove.name}?`}
          description="Item akan dihapus dari akun. Tindakan ini tidak dapat dibatalkan."
          onClose={() => setRemove(null)}
          onConfirm={async () => {
            try {
              await api(`/library/${remove.id}`, { method: "DELETE" });
              setRemove(null);
              await load();
              notify("Item dihapus dari pustaka.");
            } catch (e) {
              notify((e as Error).message, true);
            }
          }}
        />
      )}
      {editing && (
        <CustomStudio
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {importing && (
        <Modal
          title="Impor data browser ke akun ini?"
          onClose={() => setImporting(false)}
        >
          <p className="muted">
            {legacy.length} item akan disalin ke akun{" "}
            <strong>{user?.email}</strong>. Data browser asli tidak dihapus.
          </p>
          <ul className="import-list">
            {legacy.map((p, i) => (
              <li key={i}>
                {p.name}
                <small>{findLook(p.studioId)?.label}</small>
              </li>
            ))}
          </ul>
          <button
            className="button button-primary full-width"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                for (const item of legacy) {
                  if (
                    items.some(
                      (existing) =>
                        existing.kind === item.kind &&
                        existing.studioId === item.studioId &&
                        existing.name === item.name,
                    )
                  )
                    continue;
                  await api(`/library/${crypto.randomUUID()}`, {
                    method: "PUT",
                    body: JSON.stringify({
                      kind: item.kind,
                      studioId: item.studioId,
                      name: item.name,
                      data: item.data,
                    }),
                  });
                }
                localStorage.setItem(`aichemy-imported-${user?.id}`, "true");
                await load();
                setImporting(false);
                notify("Data browser berhasil diimpor.");
              } catch (e) {
                notify((e as Error).message, true);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Mengimpor…" : "Impor ke Akun Ini"}
          </button>
        </Modal>
      )}
    </main>
  );
}
