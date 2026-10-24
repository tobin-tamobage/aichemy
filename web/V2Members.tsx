import React, { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Search,
  Sparkles,
  Plus,
  Copy,
} from "lucide-react";
import {
  SERVICES,
  VIRAL_TEASERS,
  caseImage,
  setImage,
  findService,
  serviceForRecipe,
  favoriteServiceId,
  studioUrl,
} from "../shared/v2-catalog";
import type { LibraryItem } from "../shared/product";
import type { ViralContent, ViralMetadata } from "../shared/v2";
import { viralCurationLabel } from "../shared/viral-photography";
import { SIMPLE_SERVICES } from "../shared/marketing";
import { SERVICE_GROUPS, serviceGroup } from "../shared/services-v3";
import { AssetImage, Comparison } from "./V2Visuals";
import { Modal } from "./ui";
import { useSite } from "./context";
import { api } from "./api";
import { CustomStudio } from "./StudioBuilder";
export function ExploreV2() {
  const { user, notify } = useSite();
  const [query, setQuery] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [group, setGroup] = useState<string>("Semua");
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [custom, setCustom] = useState(false);
  const load = () =>
    api<{ items: LibraryItem[] }>("/library").then((r) => setItems(r.items));
  useEffect(() => {
    load().catch((e) => notify(e.message, true));
  }, []);
  const favorites = items.filter((i) => i.kind === "favorite");
  const isFavorite = (service: (typeof SERVICES)[number]) =>
    favorites.some(
      (item) =>
        item.data.serviceId === service.id ||
        (!item.data.serviceId && favoriteServiceId(item) === service.id),
    );
  const visible = SERVICES.filter(
    (s) =>
      `${s.label} ${s.audience} ${s.deliverable} ${s.keywords?.join(" ") ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (group === "Semua" || serviceGroup(s.id) === group) &&
      (!favoriteOnly ||
        favorites.some(
          (i) =>
            i.data.serviceId === s.id ||
            (!i.data.serviceId && favoriteServiceId(i) === s.id),
        )),
  );
  async function favorite(id: string) {
    const s = findService(id)!;
    const current = favorites.find(
      (i) =>
        i.data.serviceId === id ||
        (!i.data.serviceId && favoriteServiceId(i) === s.id),
    );
    try {
      if (current) await api(`/library/${current.id}`, { method: "DELETE" });
      else
        await api(`/library/${crypto.randomUUID()}`, {
          method: "PUT",
          body: JSON.stringify({
            kind: "favorite",
            studioId: s.recipeId,
            name: s.label,
            data: { serviceId: id },
          }),
        });
      await load();
      notify(
        current ? "Jasa dihapus dari favorit." : "Jasa disimpan ke favorit.",
      );
    } catch (e) {
      notify((e as Error).message, true);
    }
  }
  const selected = active ? findService(active) : null;
  return (
    <main className="v2-member-main v2-shell">
      <div className="v2-member-intro">
        <div>
          <div className="v2-kicker">RUANG KERJA STUDIO-MU</div>
          <h1>
            Mau membuat apa
            <br />
            hari ini, {user?.name.split(" ")[0]}?
          </h1>
          <p>
            Pilih jasa, lalu klik gaya yang kamu suka. Semua pilihannya bisa
            diubah lewat gambar.
          </p>
        </div>
        <Link to="/app/viral" className="v2-curation-link">
          <Sparkles size={20} />
          <div>
            <strong>Butuh ide baru?</strong>
            <span>Jelajahi Prompt Viral kurasi</span>
          </div>
          <ArrowUpRight size={19} />
        </Link>
      </div>
      {!items.some((item) => item.kind === "draft") &&
        !query &&
        !favoriteOnly && (
          <Link
            className="v2-member-start"
            to={studioUrl(SERVICES[0])}
            aria-label="Mulai racikan pertama: Foto Profil"
          >
            <AssetImage
              src={setImage(SERVICES[0].sets[0].id)}
              alt="Contoh foto profil profesional"
              small
            />
            <div>
              <span className="v2-tag">Baru mulai?</span>
              <h2>Coba Foto Profil.</h2>
              <p>Pilihannya sudah terisi. Tinggal jadikan versimu.</p>
            </div>
            <ArrowRight size={20} />
          </Link>
        )}
      {items.some((i) => i.kind === "draft") && (
        <section className="v2-recent">
          <div className="v2-row">
            <h2>Lanjutkan racikan</h2>
            <Link to="/app/pustaka">
              Semua draft <ArrowRight size={14} />
            </Link>
          </div>
          <div>
            {items
              .filter((i) => i.kind === "draft")
              .slice(0, 3)
              .map((i) => {
                const state = i.data.state as
                  { setId?: string; serviceId?: string } | undefined;
                const s =
                  findService(state?.serviceId ?? "") ??
                  serviceForRecipe(i.studioId);
                return (
                  <Link
                    key={i.id}
                    to={`/app/studio/${i.studioId}?draft=${i.id}`}
                  >
                    <AssetImage
                      src={setImage(
                        state?.setId ?? s?.sets[0].id ?? "product-marketplace",
                      )}
                      alt=""
                      small
                    />
                    <div>
                      <strong>{i.name}</strong>
                      <span>
                        {i.data.engineVersion === 2
                          ? "Racikan tersimpan"
                          : "Racikan versi sebelumnya"}{" "}
                        · {new Date(i.updatedAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <ArrowUpRight size={17} />
                  </Link>
                );
              })}
          </div>
        </section>
      )}
      <div className="v2-catalog-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari jasa, kebutuhan, atau jenis klien…"
            aria-label="Cari jasa"
          />
        </label>
        <button
          className={`button ${favoriteOnly ? "button-primary" : "button-outline"}`}
          aria-pressed={favoriteOnly}
          onClick={() => setFavoriteOnly(!favoriteOnly)}
        >
          <Heart size={16} /> Favorit
        </button>
        <span>{visible.length} jasa</span>
      </div>
      <div
        className="v3-service-groups"
        role="group"
        aria-label="Kelompok jasa"
      >
        {SERVICE_GROUPS.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={group === name}
            onClick={() => setGroup(name)}
          >
            {name}
            <span>
              {name === "Semua"
                ? SERVICES.length
                : SERVICES.filter((s) => serviceGroup(s.id) === name).length}
            </span>
          </button>
        ))}
      </div>
      <div className="v2-services v2-member-services">
        {visible.map((s, i) => (
          <article className="v2-service-card" key={s.id}>
            <button
              className="v2-service-select"
              onClick={() => setActive(s.id)}
              aria-label={`Pilih set ${s.label}`}
            >
              <div className="v2-service-image">
                <AssetImage
                  src={setImage(s.sets[0].id)}
                  alt={`Contoh hasil ${s.label}`}
                  small
                />
                <span>
                  {String(SERVICES.indexOf(s) + 1).padStart(2, "0")}
                  <ArrowUpRight size={17} />
                </span>
              </div>
              <div className="v2-service-copy">
                <h2>{SIMPLE_SERVICES[s.id]?.label ?? s.label}</h2>
                <p>{SIMPLE_SERVICES[s.id]?.result ?? s.deliverable}</p>
                <small>{s.sets.length} gaya siap racik</small>
              </div>
            </button>
            <button
              className="v2-favorite"
              aria-label={`${isFavorite(s) ? "Hapus favorit" : "Favoritkan"} ${s.label}`}
              aria-pressed={isFavorite(s)}
              onClick={() => favorite(s.id)}
            >
              <Heart size={18} fill={isFavorite(s) ? "currentColor" : "none"} />
            </button>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <Search size={30} />
          <h2>Belum ada jasa yang cocok.</h2>
          <p>Coba kata lain atau tampilkan semua jasa.</p>
          <button
            className="button button-outline"
            onClick={() => {
              setQuery("");
              setFavoriteOnly(false);
              setGroup("Semua");
            }}
          >
            Tampilkan semua
          </button>
        </div>
      )}
      <section className="v2-custom-section">
        <div>
          <div className="v2-kicker">RUANG EKSPERIMEN LANJUTAN</div>
          <h2>Punya alur kerja sendiri?</h2>
          <p>
            Studio kustom terpisah dari set terkurasi. Kelola pilihan dan
            template-mu sendiri di Pustaka Saya.
          </p>
          <div className="v2-custom-links">
            {items
              .filter((i) => i.kind === "studio")
              .map((i) => (
                <Link
                  key={i.id}
                  className="v2-text-link"
                  to={`/app/studio/${i.studioId}`}
                >
                  {i.name} <ArrowUpRight size={14} />
                </Link>
              ))}
          </div>
        </div>
        <button
          className="button button-outline"
          onClick={() => setCustom(true)}
        >
          <Plus size={17} /> Buat studio kustom
        </button>
      </section>
      {selected && (
        <Modal
          title={`Pilih gaya · ${SIMPLE_SERVICES[selected.id]?.label ?? selected.label}`}
          wide
          onClose={() => setActive(null)}
        >
          <p className="v2-modal-lead">
            Pilih gaya yang kamu suka. Semua pilihan langsung terisi, dan kamu
            bisa mengubahnya satu per satu.
          </p>
          {selected.starterNote && (
            <p className="v3-service-note">{selected.starterNote}</p>
          )}
          <div className="v2-set-picker">
            {selected.sets.map((s) => (
              <Link key={s.id} to={studioUrl(selected, s)}>
                <AssetImage src={setImage(s.id)} alt={s.label} small />
                <h3>{s.label}</h3>
                <p>{s.description}</p>
                <span>
                  Jadikan versimu <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
          <p className="v2-notice">{selected.referenceGuide}</p>
        </Modal>
      )}
      {custom && (
        <CustomStudio
          onClose={() => setCustom(false)}
          onSaved={() => {
            setCustom(false);
            load();
          }}
        />
      )}
    </main>
  );
}
export function ViralPage() {
  const { notify } = useSite();
  const [items, setItems] = useState<ViralMetadata[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<ViralContent | null>(null);
  const [opening, setOpening] = useState("");
  const [copied, setCopied] = useState(false);
  const sequence = useRef(0);
  useEffect(() => {
    api<{ items: ViralMetadata[] }>("/viral-prompts")
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }, []);
  const tags = [
    "Semua",
    ...new Set(items.flatMap((i) => i.tags).filter((t) => t !== "Kurasi")),
  ];
  const filtered = items
    .filter(
      (i) =>
        `${i.title} ${i.summary} ${i.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "Semua" || i.tags.includes(filter)),
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  async function copyViral() {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(detail.prompt);
      setCopied(true);
      notify(
        "Prompt berhasil disalin. Lampirkan foto referensi di generator pilihanmu.",
      );
    } catch {
      notify(
        "Belum bisa menyalin. Seleksi teks prompt lalu salin secara manual.",
        true,
      );
    }
  }
  async function open(id: string) {
    const seq = ++sequence.current;
    setOpening(id);
    try {
      const r = await api<ViralContent>(`/viral-prompts/${id}`);
      if (seq === sequence.current) {
        setDetail(r);
        setCopied(false);
      }
    } catch (e) {
      notify((e as Error).message, true);
    } finally {
      if (seq === sequence.current) setOpening("");
    }
  }
  return (
    <main className="v2-member-main v2-shell">
      <div className="v2-member-intro">
        <div>
          <div className="v2-kicker">PROMPT VIRAL · FOTOGRAFI</div>
          <h1>
            Satu foto.
            <br />
            Banyak karakter.
          </h1>
          <p>
            Efek cahaya, jenis shot, dan warna estetik. Pilih contoh, salin
            prompt, lalu coba bersama fotomu di generator AI favorit.
          </p>
        </div>
        <span className="v2-tag">{items.length} prompt fotografi</span>
      </div>
      <p className="v2-notice">
        Temukan gaya dari riset fotografi dan kreasi Aichemy. Contoh adalah
        ilustrasi AI dari foto referensi; hasil dapat berbeda menurut generator.
      </p>
      <div className="v2-catalog-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Cari Prompt Viral"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari flash, motion blur, potret…"
          />
        </label>
        <label className="v2-sort">
          Urutan
          <select
            aria-label="Urutan Prompt Viral"
            value="newest"
            onChange={() => {}}
          >
            <option value="newest">Terbaru diterbitkan</option>
          </select>
        </label>
      </div>
      <div className="v2-filters" aria-label="Filter efek">
        {tags.map((t) => (
          <button
            key={t}
            aria-pressed={t === filter}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="v2-viral-grid v2-member-viral">
        {filtered.map((v) => (
          <article key={v.id}>
            <button
              className="v2-viral-open"
              onClick={() => open(v.id)}
              aria-label={`Buka ${v.title}`}
              aria-busy={opening === v.id}
            >
              <AssetImage src={v.after} alt={`Contoh efek ${v.title}`} small />
              <div>
                <span className="v2-tag">
                  {viralCurationLabel(v)} · {v.tags[0]}
                </span>
                <h2>{v.title}</h2>
                <p>{v.summary}</p>
                <small>{v.references}</small>
                <span className="v2-text-link">
                  {opening === v.id ? "Membuka…" : "Lihat & salin prompt"}{" "}
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </button>
          </article>
        ))}
      </div>
      {!filtered.length && !error && (
        <div className="empty-state">
          <Sparkles />
          <h2>
            {items.length ? "Tidak ada efek yang cocok." : "Memuat koleksi…"}
          </h2>
        </div>
      )}
      {detail && (
        <Modal
          wide
          title={detail.title}
          initialFocus="close"
          onClose={() => {
            ++sequence.current;
            setDetail(null);
          }}
        >
          <div className="v2-viral-toolbar">
            <span>Prompt siap pakai · lampirkan referensi di generator AI</span>
            <button className="button button-primary" onClick={copyViral}>
              <Copy size={16} />
              {copied ? "Tersalin!" : "Salin prompt"}
            </button>
          </div>
          <div className="v2-viral-detail">
            <div>
              <Comparison
                before={detail.before}
                after={detail.after}
                label={detail.title}
              />
              <p className="v2-notice">{detail.references}</p>
              <small>
                Diterbitkan{" "}
                {new Date(`${detail.publishedAt}T00:00:00`).toLocaleDateString(
                  "id-ID",
                )}{" "}
                · {viralCurationLabel(detail)}
              </small>
            </div>
            <div>
              <p>{detail.summary}</p>
              {detail.research && (
                <aside
                  className="v2-viral-source"
                  aria-label="Sumber kurasi fotografi"
                >
                  <strong>
                    {detail.research.basis === "technique"
                      ? "Referensi teknik"
                      : "Inspirasi dari riset"}
                  </strong>
                  <a
                    href={detail.research.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {detail.research.title}{" "}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <p>{detail.research.note}</p>
                  <small>
                    Ditinjau{" "}
                    {new Date(
                      `${detail.research.checkedAt}T00:00:00`,
                    ).toLocaleDateString("id-ID")}
                  </small>
                </aside>
              )}
              <ol>
                {detail.instructions.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ol>
              <label className="v2-copy-label">
                Prompt siap pakai
                <textarea
                  readOnly
                  rows={15}
                  value={detail.prompt}
                  aria-label="Prompt Viral siap salin"
                />
              </label>
              <button
                className="button button-primary full-width"
                onClick={copyViral}
              >
                <Copy size={17} />
                {copied ? "Tersalin!" : "Salin prompt"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
