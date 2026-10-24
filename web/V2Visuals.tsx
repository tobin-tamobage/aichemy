import React, { useId, useMemo, useState } from "react";
import {
  Check,
  MoveHorizontal,
  ChevronDown,
  Search,
  ZoomIn,
  Minus,
  Heart,
  Sun,
  Star,
  Hexagon,
  Diamond,
  Shield,
  Cloud,
  Infinity,
  Orbit,
  MapPin,
  Flame,
  Music,
  Sparkles,
  Link,
  Leaf,
  Circle,
} from "lucide-react";
import type { VisualOption, VisualField } from "../shared/v2";
import { Modal } from "./ui";
export function EffectiveSummary({
  choices = [],
  set,
}: {
  choices?: { key: string; label: string; valueLabel: string }[];
  set: string;
}) {
  return (
    <details className="v2-effective">
      <summary>
        Ringkasan racikan · {set}
        <ChevronDown size={14} />
      </summary>
      <dl tabIndex={0} aria-label="Ringkasan pilihan efektif">
        {choices.map((c) => (
          <div key={c.key}>
            <dt>{c.label}</dt>
            <dd>{c.valueLabel}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
export function AssetImage({
  src,
  alt,
  eager = false,
  className = "",
  small = false,
}: {
  src: string;
  alt: string;
  eager?: boolean;
  className?: string;
  small?: boolean;
}) {
  const base = src.replace("-small.webp", ".webp");
  return (
    <img
      className={className}
      src={small ? base.replace(".webp", "-small.webp") : base}
      srcSet={
        small
          ? undefined
          : `${base.replace(".webp", "-small.webp")} 450w, ${base} 1000w`
      }
      sizes={
        small
          ? undefined
          : "(max-width:640px) 90vw, (max-width:1024px) 45vw, 580px"
      }
      width="1000"
      height="1250"
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
    />
  );
}
export function Comparison({
  before,
  after,
  label,
  eager = false,
  logo = false,
  compact = false,
}: {
  before: string;
  after: string;
  label: string;
  eager?: boolean;
  logo?: boolean;
  compact?: boolean;
}) {
  const [position, setPosition] = useState(48);
  const id = useId();
  return (
    <figure
      className={`v2-comparison ${compact ? "is-compact" : ""}`}
      aria-label={`Perbandingan ${label}`}
    >
      <div className="v2-comparison-images">
        <AssetImage
          src={after}
          alt={`${label} — ${logo ? "konsep visual" : "contoh hasil AI"}`}
          eager={eager}
          small={compact}
        />
        <div
          className="v2-before-mask"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <AssetImage
            src={before}
            alt={`${label} — ${logo ? "brief atau sketsa awal" : "foto awal sintetis"}`}
            eager={eager}
            small={compact}
          />
        </div>
        <span className="v2-compare-label before">
          {logo ? "Brief / sketsa" : "Foto awal"}
        </span>
        <span className="v2-compare-label after">
          {logo ? "Konsep visual" : "Contoh hasil AI"}
        </span>
        <div className="v2-compare-line" style={{ left: `${position}%` }}>
          <span>
            <MoveHorizontal size={18} />
          </span>
        </div>
        <input
          id={id}
          className="v2-compare-range"
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label={`Geser perbandingan ${label}`}
          aria-valuetext={`${position}% foto awal, ${100 - position}% contoh hasil`}
        />
      </div>
      {!compact && (
        <figcaption>
          Geser untuk membandingkan{" "}
          <span>Ilustrasi AI · bukan hasil pelanggan</span>
        </figcaption>
      )}
    </figure>
  );
}
export function OptionPreview({
  option,
  large = false,
}: {
  option: VisualOption;
  large?: boolean;
}) {
  const v = option.visual;
  if (v.kind === "none")
    return (
      <span className="v2-option-image v3-no-option">
        <Minus size={25} />
        <span>Tidak diatur</span>
      </span>
    );
  if (v.kind === "photo")
    return (
      <img
        className="v2-option-image"
        src={large ? v.src?.replace("-small.webp", ".webp") : v.src}
        width={large ? "800" : "350"}
        height={large ? "800" : "350"}
        alt=""
        loading="lazy"
        decoding="async"
      />
    );
  if (v.kind === "background")
    return (
      <span
        className="v2-option-image v2-background"
        style={{ background: v.color }}
      >
        {v.src !== "" && (
          <img
            src={v.src ?? "/assets/v3/portfolio/influencer-cutout-small.webp"}
            alt=""
            loading="lazy"
            width="350"
            height="350"
          />
        )}
      </span>
    );
  if (v.kind === "ratio")
    return (
      <span className="v2-option-image v2-ratio">
        <span style={{ aspectRatio: v.ratio?.replace(":", "/") }}>
          {v.ratio}
        </span>
      </span>
    );
  if (v.kind === "palette")
    return (
      <span className="v2-option-image v2-palette">
        {v.colors?.map((color) => (
          <i key={color} style={{ background: color }} />
        ))}
      </span>
    );
  if (v.kind === "type")
    return (
      <span className={`v2-option-image v2-type type-${v.layout}`}>
        {v.layout === "monogram"
          ? "Aa"
          : v.layout === "bold"
            ? "BERANI."
            : v.layout === "serif"
              ? "Cerita."
              : v.layout === "rounded"
                ? "Ramah"
                : v.layout === "handwritten"
                  ? "catatan"
                  : v.layout === "condensed"
                    ? "TEGAS"
                    : v.layout === "mono"
                      ? "Ketik."
                      : v.layout === "spaced"
                        ? "JARAK"
                        : v.layout === "slab"
                          ? "KOKOH"
                          : "Sederhana."}
      </span>
    );
  if (v.kind === "layout" && v.layout?.startsWith("mark-")) {
    const shapes = {
      heart: Heart,
      sun: Sun,
      star: Star,
      hexagon: Hexagon,
      diamond: Diamond,
      shield: Shield,
      cloud: Cloud,
      infinity: Infinity,
      orbit: Orbit,
      pin: MapPin,
      flame: Flame,
      music: Music,
      spark: Sparkles,
      link: Link,
      leaf: Leaf,
      circle: Circle,
    };
    const Shape = shapes[v.layout.slice(5) as keyof typeof shapes] ?? Circle;
    return (
      <span className="v2-option-image v4-mark-guide">
        <Shape size={64} strokeWidth={1.6} aria-hidden="true" />
      </span>
    );
  }
  if (v.kind === "layout" && v.src)
    return (
      <span className={`v2-option-image v4-frame-guide guide-${v.layout}`}>
        <img
          src={v.src}
          alt=""
          loading="lazy"
          decoding="async"
          width="450"
          height="563"
        />
        <i className="v4-frame-target" />
        <span className="v4-guide-label">
          {v.layout?.startsWith("depth-") ? "Panduan fokus" : "Panduan bingkai"}
        </span>
      </span>
    );
  return (
    <span className={`v2-option-image v2-layout layout-${v.layout}`}>
      {["head", "chest"].includes(v.layout ?? "") ? (
        <img
          className="layout-person"
          src="/assets/v3/portfolio/influencer-cutout-small.webp"
          width="350"
          height="438"
          alt=""
          loading="lazy"
        />
      ) : (
        <>
          <i className="layout-subject" />
          <i className="layout-copy">
            <b />
            <b />
            <b />
          </i>
        </>
      )}
    </span>
  );
}
export function VisualChoices({
  field,
  value,
  onChange,
  compact = false,
}: {
  field: VisualField;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const help = useId();
  const titleId = useId();
  const searchId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Semua");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [limit, setLimit] = useState(24);
  const choiceCount = field.options.filter((o) => o.value !== "__skip").length;
  const selected =
    field.options.find((o) => o.value === value) ?? field.options[0];
  const groups = useMemo(
    () => [
      "Semua",
      ...new Set(field.options.map((o) => o.group).filter(Boolean) as string[]),
    ],
    [field.options],
  );
  const matches = field.options.filter((o) => {
    const matchesGroup = group === "Semua" || o.group === group;
    const haystack = [o.label, o.hint, o.value, o.group, ...(o.keywords ?? [])]
      .join(" ")
      .toLocaleLowerCase("id");
    return (
      matchesGroup &&
      query
        .trim()
        .toLocaleLowerCase("id")
        .split(/\s+/)
        .every((word) => haystack.includes(word))
    );
  });
  const currentMatch = matches.find((o) => o.value === value);
  const ordered = currentMatch
    ? [currentMatch, ...matches.filter((o) => o.value !== value)]
    : matches;
  const visible = ordered.slice(0, limit);
  return (
    <section
      className={`v2-choice ${compact ? "is-compact" : ""}`}
      role="group"
      aria-labelledby={titleId}
      aria-describedby={help}
    >
      <div className="v2-choice-heading">
        <strong id={titleId}>{field.label}</strong>
        <span>
          {choiceCount} pilihan{field.optional ? " + Tanpa" : ""}
        </span>
      </div>
      <p id={help} className="v2-field-help">
        {field.help}
      </p>
      {selected && (
        <button
          className="v2-choice-current"
          type="button"
          aria-label={`${field.label}: ${selected.label}. Ubah dari ${choiceCount} pilihan`}
          onClick={() => {
            setOpen(true);
            setExpanded(null);
            setQuery("");
            setGroup("Semua");
            setLimit(24);
          }}
        >
          <span className="v2-choice-thumb">
            <OptionPreview option={selected} />
          </span>
          <span className="v2-choice-copy">
            <small>
              {selected.visual.kind === "none" ? "Tidak diatur" : "Dipakai"}
            </small>
            <strong>{selected.label}</strong>
            <span>{selected.hint}</span>
          </span>
          <span className="v2-choice-change">
            Ubah <ChevronDown size={16} />
          </span>
        </button>
      )}
      {field.optional && selected?.value !== "__skip" && (
        <button
          type="button"
          className="v3-skip-option"
          onClick={() => onChange("__skip")}
        >
          <Minus size={14} /> Tanpa arahan tambahan
        </button>
      )}
      {open && (
        <Modal
          title={
            expanded
              ? (field.options.find((o) => o.value === expanded)?.label ??
                expanded)
              : `Pilih ${field.label.toLocaleLowerCase("id")}`
          }
          onClose={() => {
            setOpen(false);
            setExpanded(null);
            setQuery("");
            setGroup("Semua");
          }}
          wide
        >
          {expanded ? (
            <div className="v2-option-expanded">
              <button
                className="button button-outline"
                type="button"
                onClick={() => setExpanded(null)}
              >
                Kembali ke pilihan
              </button>
              {(() => {
                const option = field.options.find((o) => o.value === expanded);
                return option ? (
                  <>
                    <div className="v2-option-expanded-image">
                      <OptionPreview option={option} large />
                    </div>
                    <p>
                      <strong>{option.label}</strong> · {option.hint}
                    </p>
                  </>
                ) : null;
              })()}
            </div>
          ) : (
            <>
              <p className="v2-gallery-help">
                {field.help} Contoh ini menunjukkan pilihan satu per satu, bukan
                hasil racikan langsung.
              </p>
              <label className="v2-gallery-search" htmlFor={searchId}>
                <Search size={18} aria-hidden="true" />
                <input
                  id={searchId}
                  type="search"
                  autoComplete="off"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setLimit(24);
                  }}
                  placeholder={`Cari ${field.label.toLocaleLowerCase("id")}`}
                />
              </label>
              {groups.length > 2 && (
                <div
                  className="v2-gallery-groups"
                  role="group"
                  aria-label="Kelompok pilihan"
                >
                  {groups.map((name) => (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={group === name}
                      onClick={() => {
                        setGroup(name);
                        setLimit(24);
                      }}
                    >
                      {name === "Semua"
                        ? name
                        : name.charAt(0).toLocaleUpperCase("id") +
                          name.slice(1)}
                    </button>
                  ))}
                </div>
              )}
              <p className="v4-result-count" role="status" aria-live="polite">
                {matches.length} pilihan
                {query.trim() ? ` untuk “${query.trim()}”` : " tersedia"}
                {visible.length < matches.length
                  ? ` · ${visible.length} ditampilkan`
                  : ""}
              </p>
              {visible.length ? (
                <div className="v2-gallery-grid">
                  {visible.map((option) => (
                    <article
                      className={`v2-gallery-option ${value === option.value ? "selected" : ""}`}
                      key={option.value}
                    >
                      <button
                        className="v2-gallery-select"
                        type="button"
                        disabled={!!option.disabledReason}
                        aria-pressed={value === option.value}
                        onClick={() => {
                          onChange(option.value);
                          setOpen(false);
                          setExpanded(null);
                          setQuery("");
                          setGroup("Semua");
                        }}
                        title={option.disabledReason}
                      >
                        <span className="v2-option-art">
                          <OptionPreview option={option} />
                          {value === option.value && (
                            <span className="v2-selected-check">
                              <Check size={13} strokeWidth={3} />
                            </span>
                          )}
                        </span>
                        <strong>{option.label}</strong>
                        <small>{option.disabledReason ?? option.hint}</small>
                        {value === option.value && (
                          <span className="v2-option-used">Dipakai</span>
                        )}
                      </button>
                      <button
                        className="v2-gallery-zoom"
                        type="button"
                        aria-label={`Perbesar contoh ${option.label}`}
                        onClick={() => setExpanded(option.value)}
                      >
                        <ZoomIn size={15} />
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="v2-gallery-empty">
                  <p>Tidak ada pilihan yang cocok.</p>
                  <button
                    className="v2-text-link"
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setGroup("Semua");
                    }}
                  >
                    Hapus pencarian
                  </button>
                </div>
              )}
              {visible.length < matches.length && (
                <div className="v4-load-options">
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setLimit((count) => count + 24)}
                  >
                    Tampilkan {Math.min(24, matches.length - visible.length)}{" "}
                    pilihan lagi
                  </button>
                  <span>
                    {matches.length - visible.length} pilihan lainnya · atau
                    cari lewat nama
                  </span>
                </div>
              )}
            </>
          )}
        </Modal>
      )}
    </section>
  );
}
