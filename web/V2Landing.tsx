import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Layers3,
  Menu,
  MousePointer2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  SERVICES,
  FEATURED_CASES,
  SETS,
  caseImage,
  setImage,
  findService,
  VIRAL_TEASERS,
  studioUrl,
} from "../shared/v2-catalog";
import { type StudioSet } from "../shared/v2";
import { Brand, Modal, PurchaseButton, ThemeToggle } from "./ui";
import { AssetImage, Comparison } from "./V2Visuals";
import { useSite } from "./context";
import { viralCurationLabel } from "../shared/viral-photography";
import {
  PRODUCT_COUNTS,
  INCOME_EXAMPLES,
  SIMPLE_SERVICES,
  SALES_SERVICES,
} from "../shared/marketing";

const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
const nav = [
  ["Pilihan Jasa", "jasa"],
  ["Contoh Hasil", "contoh"],
  ["Cara Kerja", "cara-kerja"],
  ["Harga", "harga"],
  ["FAQ", "faq"],
];
const faq = [
  [
    "Apa yang saya dapat setelah membeli?",
    `Akses ke ${PRODUCT_COUNTS.services} pilihan jasa, ${PRODUCT_COUNTS.styles} gaya awal, dan ${PRODUCT_COUNTS.photographyPrompts} prompt fotografi siap salin. Kamu juga bisa menyimpan racikan, melanjutkan pekerjaan dari HP atau laptop, dan membuat studio sendiri. Sekali bayar Rp149.000 untuk satu akun pribadi.`,
  ],
  [
    "Apakah gambar dibuat di Aichemy?",
    "Aichemy menyusun prompt, yaitu instruksi untuk AI. Kamu tinggal memilih contoh gambar, mengatur tampilannya, lalu menyalin prompt ke aplikasi gambar seperti GPT Image atau Nano Banana. Akses dan biaya aplikasi tersebut terpisah.",
  ],
  [
    "Saya belum mengerti prompt atau fotografi. Bisa pakai?",
    `Bisa. Mulai dari ${PRODUCT_COUNTS.styles} gaya yang sudah disiapkan. Klik gambar untuk memilih latar, pakaian, pose, dan cahaya. Tidak perlu menulis instruksi dari nol. Detail tambahan boleh diisi kalau kamu membutuhkannya.`,
  ],
  [
    "Apakah wajah dan produk pasti sama?",
    "Prompt sudah meminta AI menjaga wajah, bentuk produk, dan detail penting. Hasilnya tetap bergantung pada aplikasi AI serta foto yang kamu pakai. Gunakan foto yang jelas, lalu periksa hasil sebelum dikirim ke klien.",
  ],
  [
    "Bolehkah hasilnya dijual?",
    "Boleh dipakai untuk membuat karya yang kamu tawarkan sebagai jasa. Pastikan aplikasi AI yang kamu gunakan mengizinkan penggunaan komersial dan kamu punya izin memakai foto atau merek klien. Periksa dan rapikan hasilnya sebelum diserahkan.",
  ],
  [
    "Bisa untuk pas foto KTP-el?",
    "Aichemy tidak menggantikan perekaman KTP-el di pelayanan Dukcapil dan tidak menjamin diterima instansi. Gunakan untuk kebutuhan foto formal yang diperbolehkan, lalu periksa persyaratan instansi tujuan.",
  ],
  [
    "Apa arti akses selamanya?",
    "Kamu membayar Rp149.000 satu kali untuk satu akun pribadi. Akses Aichemy tidak punya tanggal kedaluwarsa, termasuk pembaruan fitur mendatang. Biaya aplikasi pembuat gambar tetap terpisah.",
  ],
  [
    "Bagaimana cara mulai setelah membeli?",
    "Buat akun, verifikasi email, lalu selesaikan pembayaran. Akses aktif setelah pembayaran terkonfirmasi. Setelah itu, pilih jasa dan gaya awal, racik lewat gambar, lalu salin promptmu.",
  ],
  [
    "Apa isi Prompt Viral?",
    `Ada ${VIRAL_TEASERS.length} prompt fotografi siap salin, seperti flash digicam, motion blur, dan cahaya prisma. Ada gaya dari riset dan kreasi Aichemy. Koleksi dapat bertambah lewat pembaruan, tanpa jadwal harian atau jaminan hasil viral.`,
  ],
  [
    "Bisa digunakan di HP dan apakah menyimpan foto klien?",
    "Bisa melalui browser HP, tablet, atau komputer. Draft dan preset disimpan di akun. Aichemy tidak perlu menerima foto klien; lampirkan fotonya langsung pada generator eksternal sesuai izin dan kebijakan privasimu.",
  ],
];

export function IncomePotential() {
  return (
    <section
      className="v2-income v2-section"
      id="potensi"
      aria-labelledby="income-heading"
    >
      <div className="v2-shell">
        <div className="v2-section-head">
          <div>
            <div className="v2-kicker">DARI KARYA, JADI PELUANG USAHA</div>
            <h2 id="income-heading">Mulai dari beberapa pesanan.</h2>
          </div>
          <p>
            Foto profil, produk, atau pasangan. Pilih satu jasa untuk mulai—ini
            contoh sederhana potensi omzetnya.
          </p>
        </div>
        <div className="v2-income-grid">
          {INCOME_EXAMPLES.map((example) => (
            <article className="v2-income-card" key={example.id}>
              <AssetImage
                src={caseImage(example.image)}
                alt={`Contoh ${example.label.toLowerCase()}`}
                small
              />
              <div>
                <span className="v2-tag">Contoh hitungan bulanan</span>
                <h3>{example.label}</h3>
                <p>{example.client}</p>
                <div className="v2-income-equation">
                  {example.orders} pesanan × {money(example.price)}
                </div>
                <strong>{money(example.orders * example.price)}</strong>
                <span className="v2-income-label">potensi omzet / bulan</span>
              </div>
            </article>
          ))}
        </div>
        <p className="v2-income-note">
          Angka contoh, bukan patokan harga atau jaminan penghasilan. Omzet
          belum dipotong biaya aplikasi AI, revisi, dan biaya usaha lainnya.
        </p>
        <div className="v2-income-cta">
          <PurchaseButton>
            Mulai bangun studio-mu <ArrowUpRight size={17} />
          </PurchaseButton>
          <span>Aichemy Rp149.000 sekali bayar</span>
        </div>
      </div>
    </section>
  );
}
function HeroPortfolio({
  hero,
  onChange,
}: {
  hero: string;
  onChange: (id: string) => void;
}) {
  const heroSet = SETS.find((s) => s.id === hero)!;
  return (
    <div className="v2-hero-work">
      <div className="v2-portfolio-header">
        <span>
          <i /> CONTOH KARYA STUDIO AI
        </span>
        <span>Ilustrasi AI</span>
      </div>
      <div className="v2-hero-tabs" aria-label="Contoh jasa utama">
        {[
          ["professional-linkedin", "Profesional"],
          ["prewedding-minimal", "Prewedding"],
          ["product-marketplace", "Produk"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={hero === id}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <Comparison
        key={hero}
        before={caseImage(hero, "before")}
        after={caseImage(hero)}
        label={heroSet.label}
        eager
      />
      <div className="v2-work-caption">
        <div>
          <strong>{heroSet.label}</strong>
          <span>{findService(heroSet.serviceId)!.audience}</span>
        </div>
        <span className="v2-tag">
          Contoh peluang jasa <ArrowUpRight size={13} />
        </span>
      </div>
    </div>
  );
}
export default function Landing() {
  const { user } = useSite();
  const [menu, setMenu] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    navigation.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [menu]);
  function visitSection(id: string) {
    if (!menu) return;
    setMenu(false);
    requestAnimationFrame(() => {
      const heading = document
        .getElementById(id)
        ?.querySelector<HTMLElement>("h2");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    });
  }
  const [hero, setHero] = useState("professional-linkedin");
  const [allServices, setAllServices] = useState(false);
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(3);
  const [detail, setDetail] = useState<StudioSet | null>(null);
  const [portfolioService, setPortfolioService] = useState<string | null>(null);
  const featured = [
    "professional-linkedin",
    "prewedding-minimal",
    "product-skincare",
    "formal-cv",
    "food-restaurant",
    "ads-promo",
  ];
  const cases = SETS.filter(
    (s) => filter === "all" || s.serviceId === filter,
  ).sort((a, b) => {
    const rank = (id: string) =>
      featured.includes(id) ? featured.indexOf(id) : featured.length;
    return rank(a.id) - rank(b.id);
  });
  return (
    <div className="v2-site">
      <a className="v2-skip-link" href="#main-content">
        Langsung ke isi
      </a>
      <header className="v2-header">
        <div className="v2-shell v2-nav">
          <Brand />
          <nav
            ref={navigation}
            id="landing-navigation"
            className={menu ? "is-open" : ""}
            aria-label="Navigasi utama"
          >
            {nav.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => visitSection(id)}>
                {label}
              </a>
            ))}
          </nav>
          <div className="v2-nav-actions">
            <ThemeToggle />
            <Link to={user?.active ? "/app" : "/masuk"} className="v2-login">
              {user?.active ? "Buka Studio" : "Masuk"}
              <ArrowUpRight size={14} />
            </Link>
            <button
              className="icon-btn v2-menu"
              ref={menuButton}
              aria-controls="landing-navigation"
              aria-expanded={menu}
              aria-label={menu ? "Tutup menu" : "Buka menu"}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="v2-hero v2-shell">
          <div className="v2-hero-copy">
            <div className="v2-kicker">
              <span /> PILIH GAMBARNYA. RACIK PROMPT-NYA.
            </div>
            <h1>
              Bangun Studio
              <br />
              <span>AI-mu.</span> Mulai
              <br />
              Jual Jasa Foto.
            </h1>
            <p>
              Foto profil, prewedding, produk, sampai iklan.{" "}
              <strong>
                Pilih contoh gambar, Aichemy menyusun instruksi AI-nya.
              </strong>{" "}
              Salin ke aplikasi gambar favoritmu, lalu siapkan hasil untuk
              klien.
            </p>
            <div className="v2-hero-actions">
              <PurchaseButton>
                Dapatkan Akses — Rp149.000 <ArrowUpRight size={18} />
              </PurchaseButton>
              <a href="#cara-kerja" className="v2-text-link">
                Lihat cara kerjanya <ArrowRight size={17} />
              </a>
            </div>
            <div className="v2-purchase-notes">
              <span>
                <Check size={14} /> Sekali bayar
              </span>
              <span>
                <Check size={14} /> Akses selamanya
              </span>
              <span>
                <Check size={14} /> Termasuk pembaruan
              </span>
            </div>
            <p className="v2-disclaimer">
              Prompt adalah instruksi untuk AI. Gambar dibuat di aplikasi AI
              pilihanmu; biaya aplikasi tersebut terpisah.
            </p>
          </div>
          <div className="v2-hero-visual">
            <HeroPortfolio hero={hero} onChange={setHero} />
          </div>
        </section>
        <div className="v2-proof-strip">
          <div className="v2-shell">
            <p>Siap untuk ide jasa pertamamu.</p>
            <span>
              <strong>{PRODUCT_COUNTS.services}</strong> pilihan jasa
            </span>
            <span>
              <strong>{PRODUCT_COUNTS.styles}</strong> gaya awal
            </span>
            <span>
              <strong>{PRODUCT_COUNTS.photographyPrompts}</strong> prompt
              fotografi
            </span>
            <span>Racik prompt sepuasnya di Aichemy</span>
          </div>
        </div>
        <section className="v2-section v2-shell" id="jasa">
          <div className="v2-section-head">
            <div>
              <div className="v2-kicker">
                SATU PLATFORM, BANYAK PILIHAN JASA
              </div>
              <h2>
                Jasa apa yang ingin
                <br />
                kamu tawarkan?
              </h2>
            </div>
            <p>
              Bantu orang tampil profesional. Bikin produk UMKM lebih menarik.
              Atau buat foto pasangan untuk undangan. Kamu ingin mulai dari
              mana?
            </p>
          </div>
          <div className="v2-services" id="all-service-options">
            {SALES_SERVICES.slice(
              0,
              allServices ? SALES_SERVICES.length : 6,
            ).map((s, i) => (
              <a
                key={s.id}
                className="v2-service-card"
                href="#contoh"
                onClick={(event) => {
                  if (!FEATURED_CASES.some((c) => c.serviceId === s.id)) {
                    event.preventDefault();
                    setPortfolioService(s.id);
                    return;
                  }
                  setFilter(s.id);
                  setLimit(3);
                }}
              >
                <div
                  className="v2-service-image"
                  style={{ background: s.color }}
                >
                  <AssetImage
                    src={setImage(s.sets[0].id)}
                    alt={`Contoh ${s.label}`}
                    small
                  />
                  <span>
                    {String(i + 1).padStart(2, "0")} <ArrowUpRight size={16} />
                  </span>
                </div>
                <div className="v2-service-copy">
                  <h3>{SIMPLE_SERVICES[s.id]?.label ?? s.label}</h3>
                  <p>{SIMPLE_SERVICES[s.id]?.result ?? s.deliverable}</p>
                  <small>
                    Untuk {SIMPLE_SERVICES[s.id]?.customer ?? s.audience}
                  </small>
                </div>
              </a>
            ))}
          </div>
          <div className="v2-services-more">
            <button
              className="button button-outline"
              aria-expanded={allServices}
              aria-controls="all-service-options"
              onClick={() => setAllServices((value) => !value)}
            >
              {allServices
                ? "Tampilkan jasa utama"
                : `Lihat ${SERVICES.length - 6} jasa lainnya`}{" "}
              <ChevronDown size={17} />
            </button>
            <p>
              Termasuk konten sosial, sinematik, properti, logo, dan edit
              cahaya.
            </p>
          </div>
          <div className="v2-inline-note">
            <ShieldCheck size={18} />
            <p>
              Mulai dari satu jasa dulu. Buat beberapa contoh karya, lalu
              tawarkan kepada calon klien yang paling dekat denganmu.
            </p>
          </div>
        </section>
        <section className="v2-section v2-gallery-section" id="contoh">
          <div className="v2-shell">
            <div className="v2-section-head">
              <div>
                <div className="v2-kicker">LIHAT CONTOH SEBELUM MULAI</div>
                <h2>
                  Foto awalnya sederhana.
                  <br />
                  Hasilnya bisa berbeda.
                </h2>
              </div>
              <p>
                Geser gambar untuk melihat perubahannya. Ada {SETS.length}{" "}
                contoh dari berbagai jasa, dibuat dengan AI dari foto sumber
                yang sama. Hasilmu dapat berbeda.
              </p>
            </div>
            <div className="v2-filters" aria-label="Filter contoh">
              <button
                aria-pressed={filter === "all"}
                onClick={() => {
                  setFilter("all");
                  setLimit(3);
                }}
              >
                Semua jasa
              </button>
              {SERVICES.filter((s) =>
                FEATURED_CASES.some((c) => c.serviceId === s.id),
              ).map((s) => (
                <button
                  key={s.id}
                  aria-pressed={filter === s.id}
                  onClick={() => {
                    setFilter(s.id);
                    setLimit(3);
                  }}
                >
                  {s.short}
                </button>
              ))}
            </div>
            <div className="v2-case-grid">
              {cases.slice(0, limit).map((s) => (
                <article className="v2-case-card" key={s.id}>
                  <Comparison
                    before={caseImage(s.id, "before")}
                    after={caseImage(s.id)}
                    label={s.label}
                    logo={s.serviceId === "branding"}
                    compact
                  />
                  <div className="v2-case-copy">
                    <span className="v2-kicker">
                      {findService(s.serviceId)!.short}
                    </span>
                    <h3>{s.label}</h3>
                    <p>{s.description}</p>
                    <button
                      className="v2-text-link"
                      onClick={() => setDetail(s)}
                    >
                      Lihat racikannya <ArrowUpRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {limit < cases.length && (
              <div className="v2-center">
                <button
                  className="button button-outline"
                  onClick={() => setLimit((n) => n + 3)}
                >
                  Muat contoh lainnya <ChevronDown size={16} />
                </button>
                <small>
                  {Math.min(limit, cases.length)} dari {cases.length} contoh
                </small>
              </div>
            )}
            <div className="v2-gallery-next">
              <p>Sudah punya gaya yang kamu suka?</p>
              <a href="#cara-kerja" className="button button-primary">
                Lihat cara meraciknya <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>
        <section className="v2-section v2-shell" id="cara-kerja">
          <div className="v2-section-head">
            <div>
              <div className="v2-kicker">TIGA LANGKAH MUDAH</div>
              <h2>
                Pilih. Racik.
                <br />
                Salin prompt-nya.
              </h2>
            </div>
            <p>
              Tidak perlu hafal istilah kamera atau menulis instruksi panjang.
              Mulai dari contoh yang sudah ada.
            </p>
          </div>
          <div className="v2-steps v2-visual-walkthrough">
            {[
              [
                "01",
                "Pilih jasa & gaya",
                "Mau foto profil, produk, atau prewedding? Pilih contoh yang paling dekat dengan idemu.",
              ],
              [
                "02",
                "Ubah lewat gambar",
                "Klik Ubah untuk memilih latar, cahaya, pakaian, dan pose. Tidak perlu isi formulir panjang.",
              ],
              [
                "03",
                "Salin & buat gambarnya",
                "Tempel prompt dan foto referensi di aplikasi AI. Periksa hasilnya, rapikan, lalu siapkan untuk klien.",
              ],
            ].map(([n, title, copy]) => (
              <article key={n}>
                <div className="v2-walkthrough-art">
                  {n === "01" ? (
                    <>
                      <AssetImage
                        src={setImage("professional-linkedin")}
                        alt="Contoh gaya awal foto profesional untuk profil bisnis"
                        small
                      />
                      <span className="v2-walkthrough-caption">
                        Foto profesional · Profil bisnis
                      </span>
                    </>
                  ) : n === "02" ? (
                    <div
                      className="v2-walkthrough-options"
                      role="group"
                      aria-label="Ilustrasi pilihan pose di dalam studio"
                    >
                      {[
                        ["standing-front", "Berdiri"],
                        ["seated-upright", "Duduk"],
                        ["walking", "Berjalan"],
                      ].map(([id, label]) => (
                        <figure
                          key={id}
                          className={
                            id === "seated-upright" ? "is-selected" : ""
                          }
                        >
                          <img
                            src={`/assets/v3/poses/${id}-small.webp`}
                            alt={`Contoh pose ${label.toLowerCase()}`}
                            width="450"
                            height="563"
                            loading="lazy"
                            decoding="async"
                          />
                          <figcaption>
                            {label}
                            {id === "seated-upright" && (
                              <Check
                                size={13}
                                aria-label="Contoh pilihan aktif"
                              />
                            )}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : (
                    <div className="v2-walkthrough-prompt">
                      <span>
                        <Sparkles size={16} aria-hidden="true" /> Prompt
                        tersusun
                      </span>
                      <p lang="en">
                        Create a professional portrait. Preserve the person’s
                        identity. Use a relaxed seated pose and soft, natural
                        lighting.
                      </p>
                      <span>
                        <Copy size={15} aria-hidden="true" /> Siap disalin dari
                        studio
                      </span>
                    </div>
                  )}
                </div>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <p className="v2-walkthrough-note">
            Ilustrasi alur di dalam studio, bukan demo interaktif. Setelah
            membeli, kamu bisa meracik sendiri dan menyalin prompt ke aplikasi
            AI pilihanmu. Gambar tidak dibuat di Aichemy.
          </p>
        </section>
        <section className="v2-section v2-viral-section" id="viral">
          <div className="v2-shell">
            <div className="v2-section-head">
              <div>
                <div className="v2-kicker">PROMPT VIRAL · FOTOGRAFI</div>
                <h2>
                  Foto biasa.
                  <br />
                  Karakter luar biasa.
                </h2>
              </div>
              <div>
                <p>
                  {VIRAL_TEASERS.length} prompt fotografi siap salin: flash
                  digicam, motion blur, bias prisma, dan ide lain untuk etalase
                  jasamu. Cukup lampirkan foto di generator AI pilihanmu.
                </p>
                <PurchaseButton className="v2-small-cta">
                  Buka akses koleksi fotografi <ArrowUpRight size={16} />
                </PurchaseButton>
              </div>
            </div>
            <div className="v2-viral-grid">
              {VIRAL_TEASERS.slice(0, 6).map((v) => (
                <article key={v.id}>
                  <AssetImage
                    src={v.after}
                    alt={`Contoh efek ${v.title}`}
                    small
                  />
                  <div>
                    <span className="v2-tag">
                      {viralCurationLabel(v)} · {v.tags[0]}
                    </span>
                    <h3>{v.title}</h3>
                    <p>{v.summary}</p>
                    <small>Prompt siap salin · termasuk akses Rp149.000</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="v2-section v2-shell">
          <div className="v2-section-head">
            <div>
              <div className="v2-kicker">
                DIBUAT UNTUK PEKERJAAN YANG BISA DIULANG
              </div>
              <h2>
                Simpan gaya andalan.
                <br />
                Pakai lagi untuk klien berikutnya.
              </h2>
            </div>
            <p>
              Semua racikan ada di satu tempat. Lanjutkan pekerjaanmu dari HP
              atau laptop dengan akun yang sama.
            </p>
          </div>
          <div className="v2-benefits">
            {[
              [
                MousePointer2,
                "Memilih lewat gambar",
                "Lihat contoh latar, pose, pakaian, dan cahaya sebelum memilih. Gampang tahu mana yang kamu suka.",
              ],
              [
                SlidersHorizontal,
                "Instruksi langsung dirangkai",
                "Aichemy menyusun pilihanmu jadi prompt siap salin. Kamu tetap bisa menyuntingnya sendiri.",
              ],
              [
                Layers3,
                "Simpan gaya favoritmu",
                "Sudah menemukan gaya yang pas? Simpan dan pakai lagi tanpa mengatur semuanya dari awal.",
              ],
              [
                Copy,
                "Aman untuk coba-coba",
                "Batalkan perubahan, lanjutkan pekerjaan yang tersimpan, atau unduh prompt. Tulisanmu tetap terjaga.",
              ],
            ].map(([Icon, title, copy]) => {
              const I = Icon as typeof Copy;
              return (
                <article key={title as string}>
                  <I size={23} />
                  <h3>{title as string}</h3>
                  <p>{copy as string}</p>
                </article>
              );
            })}
          </div>
        </section>
        <IncomePotential />
        <section className="v2-section v2-shell v2-price-grid" id="harga">
          <div>
            <div className="v2-kicker">SEKALI BAYAR, PAKAI TERUS</div>
            <h2>
              Satu akses untuk
              <br />
              semua ide jasamu.
            </h2>
            <p>
              Semua pilihan jasa, gaya, dan alat racik dalam satu akun. Mulai
              dengan satu jasa, lalu tambah layanan saat kamu siap.
            </p>
            <div className="v2-price-note">
              <ShieldCheck size={22} />
              <p>Buat akun → verifikasi email → bayar → mulai meracik.</p>
            </div>
          </div>
          <div className="v2-price-card">
            <div className="v2-price-top">
              <span className="v2-tag">Akses Selamanya</span>
              <Sparkles size={23} />
            </div>
            <h3>
              Ruang kreasi untuk
              <br />
              studio-mu.
            </h3>
            <div className="v2-price">Rp149.000</div>
            <p>Sekali bayar · satu akun pribadi</p>
            <ul>
              {[
                `${PRODUCT_COUNTS.services} pilihan jasa & ${PRODUCT_COUNTS.styles} gaya awal`,
                "Pilih latar, cahaya, pakaian & pose lewat gambar",
                `${VIRAL_TEASERS.length} prompt fotografi siap salin`,
                "Simpan racikan & lanjutkan di HP atau laptop",
                "Sunting, batalkan perubahan & unduh prompt",
                "Buat studio dengan pilihanmu sendiri",
                "Tanpa tanggal kedaluwarsa & termasuk pembaruan",
              ].map((x) => (
                <li key={x}>
                  <Check size={17} />
                  {x}
                </li>
              ))}
            </ul>
            <PurchaseButton>
              Dapatkan Akses — Rp149.000 <ArrowUpRight size={18} />
            </PurchaseButton>
            <small>
              Satu akun pribadi. Tidak ada biaya bulanan Aichemy. Aplikasi
              pembuat gambar dibayar terpisah.
            </small>
          </div>
        </section>
        <section className="v2-section v2-faq-section" id="faq">
          <div className="v2-shell v2-faq-grid">
            <div>
              <div className="v2-kicker">SEBELUM KAMU MULAI</div>
              <h2>
                Masih ada
                <br />
                yang ingin ditanyakan?
              </h2>
              <p>
                Masih punya pertanyaan?{" "}
                <Link to="/kontak">
                  Hubungi pengelola <ArrowUpRight size={14} />
                </Link>
              </p>
            </div>
            <div>
              {faq.map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <ChevronDown size={18} />
                  </summary>
                  <p>
                    {a}
                    {q.includes("KTP-el") && (
                      <>
                        {" "}
                        <a
                          href="https://disdukcapil.bandaacehkota.go.id/hasil-foto-wajib-disetujui-pemohon-dirjen-dukcapil-terbitkan-panduan-rekam-ktp-el/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Panduan Dukcapil
                        </a>
                        .
                      </>
                    )}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="v2-final">
          <div className="v2-shell">
            <div className="v2-kicker">PELUANG DIMULAI DARI KARYA PERTAMA</div>
            <h2>
              Studio-mu.
              <br />
              <span>Mulai dari karya pertamamu.</span>
            </h2>
            <p>
              Pilih satu jasa. Racik gaya yang kamu suka. Buat contoh karya,
              lalu mulai tawarkan ke calon klienmu.
            </p>
            <PurchaseButton>
              Dapatkan Akses — Rp149.000 <ArrowUpRight size={18} />
            </PurchaseButton>
          </div>
        </section>
      </main>
      <footer className="v2-footer v2-shell">
        <div>
          <Brand />
          <p>Racik prompt lewat gambar. Mulai jasa studio AI-mu.</p>
        </div>
        <nav aria-label="Informasi produk">
          <Link to="/ketentuan">Ketentuan akses</Link>
          <Link to="/privasi">Privasi</Link>
          <Link to="/kontak">Kontak</Link>
        </nav>
        <small>
          © {new Date().getFullYear()} Aichemy. Contoh visual adalah ilustrasi
          AI, bukan bukti pendapatan atau hasil pelanggan.
        </small>
      </footer>
      <div className="v2-mobile-purchase">
        <div>
          <b>Rp149.000</b>
          <span>Sekali bayar · akses selamanya</span>
        </div>
        <PurchaseButton>
          Buka Akses <ArrowUpRight size={16} />
        </PurchaseButton>
      </div>
      {portfolioService &&
        (() => {
          const s = SERVICES.find(
            (service) => service.id === portfolioService,
          )!;
          return (
            <Modal
              title={SIMPLE_SERVICES[s.id]?.label ?? s.label}
              wide
              onClose={() => setPortfolioService(null)}
            >
              <p className="v2-modal-lead">
                {s.deliverable}. Untuk {s.audience.toLocaleLowerCase("id")}.
              </p>
              <div className="v2-set-picker v3-public-portfolio">
                {s.sets.map((set) => (
                  <article key={set.id}>
                    <AssetImage src={setImage(set.id)} alt={set.label} small />
                    <h3>{set.label}</h3>
                    <p>{set.description}</p>
                  </article>
                ))}
              </div>
              <p className="v2-notice">
                Ilustrasi AI, bukan hasil pelanggan atau hasil langsung dari
                racikan. Buat gambar di aplikasi AI pilihanmu; biaya dan
                hasilnya dapat berbeda.
              </p>
              <PurchaseButton>
                Dapatkan semua gaya — Rp149.000 <ArrowUpRight size={16} />
              </PurchaseButton>
            </Modal>
          );
        })()}
      {detail && (
        <Modal
          title={`Racikan: ${detail.label}`}
          wide
          onClose={() => setDetail(null)}
        >
          <div className="v2-case-detail">
            <Comparison
              before={caseImage(detail.id, "before")}
              after={caseImage(detail.id)}
              label={detail.label}
              logo={detail.serviceId === "branding"}
            />
            <div>
              <span className="v2-tag">
                {findService(detail.serviceId)!.label}
              </span>
              <h3>{detail.label}</h3>
              <p>{detail.description}</p>
              <dl>
                <dt>Foto awal</dt>
                <dd>{detail.input}</dd>
                <dt>Yang berubah</dt>
                <dd>{detail.changes}</dd>
                <dt>Yang dijaga</dt>
                <dd>{detail.preserved}</dd>
              </dl>
              <p className="v2-notice">
                {findService(detail.serviceId)!.referenceGuide}
              </p>
              <p>
                Pilih gaya ini untuk mengisi racikan awalmu. Kamu bisa mengubah
                latar, cahaya, dan detail lainnya setelah masuk.
              </p>
              {user?.active ? (
                <Link
                  className="button button-primary"
                  to={studioUrl(findService(detail.serviceId)!, detail)}
                >
                  Jadikan versimu <ArrowUpRight size={17} />
                </Link>
              ) : (
                <PurchaseButton>
                  Buka akses untuk meracik <ArrowUpRight size={17} />
                </PurchaseButton>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
