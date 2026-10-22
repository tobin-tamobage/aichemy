import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Layers3,
  LayoutGrid,
  Menu,
  MousePointer2,
  Palette,
  Play,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { LOOKS, DEMO_PROMPTS, PRICE_LABEL } from "../shared/product";
import { Brand, ExampleImage, PurchaseButton, ThemeToggle } from "./ui";
import { useSite } from "./context";

const features = [
  [
    LayoutGrid,
    "10 studio, banyak kemungkinan.",
    "Produk, makanan, potret, sinematik, properti, logo, dan banyak lagi. Pilih ruang kreasi yang sesuai idemu.",
  ],
  [
    Palette,
    "Pilih visual, bukan tebak istilah.",
    "Jelajahi referensi cahaya, komposisi, gaya, dan warna. Pahami pilihanmu sebelum menyalin prompt.",
  ],
  [
    SlidersHorizontal,
    "Sederhana dulu. Detail kemudian.",
    "Mulai dari pilihan penting. Buka kontrol kamera, lensa, dan estetika ketika ingin bereksperimen lebih jauh.",
  ],
  [
    Layers3,
    "Simpan gaya andalanmu.",
    "Simpan preset, favorit, dan draft di akunmu. Lanjutkan ide yang sama dari perangkat lain.",
  ],
  [
    WandSparkles,
    "Studio buatanmu sendiri.",
    "Rancang pilihan dan template untuk alur kerja yang sering kamu gunakan. Ide unik layak punya ruang sendiri.",
  ],
  [
    Copy,
    "Prompt rapi, siap dipakai.",
    "Sunting hasilnya, batalkan perubahan, salin, atau unduh. Bawa prompt ke aplikasi gambar AI pilihanmu.",
  ],
] as const;
const faqs = [
  [
    "Aichemy itu aplikasi apa?",
    "Aichemy adalah prompt builder visual. Kamu memilih subjek, pencahayaan, komposisi, dan gaya, lalu Aichemy menyusunnya menjadi prompt bahasa Inggris yang siap digunakan di aplikasi gambar AI.",
  ],
  [
    "Apakah Aichemy membuat gambar?",
    "Tidak. Gambar dibuat di aplikasi pilihanmu, misalnya GPT Image atau Nano Banana. Aichemy membantu meracik arah visual dan prompt. Akses maupun biaya aplikasi AI tersebut terpisah.",
  ],
  [
    "Apa arti akses lifetime?",
    "Cukup satu kali pembelian Rp149.000 untuk satu akun pribadi. Hak akses tidak memiliki tanggal kedaluwarsa dan mencakup pembaruan fitur Aichemy mendatang. Tidak ada tagihan langganan Aichemy.",
  ],
  [
    "Bagaimana cara mendapatkan akses?",
    "Buat akun, verifikasi email, lalu selesaikan pembayaran. Setelah pembayaran berhasil diverifikasi, akses studio aktif otomatis pada akun yang sama.",
  ],
  [
    "Saya pemula, apakah bisa menggunakannya?",
    "Bisa. Mulai dari contoh tampilan yang sudah disiapkan, ubah beberapa pilihan, lalu salin prompt. Penjelasan singkat membantu kamu memahami istilah dan pengaruh setiap pilihan.",
  ],
  [
    "Bisa dipakai di HP?",
    "Bisa. Aichemy berjalan di browser HP, tablet, dan komputer. Draft serta preset tersimpan di akun agar kamu bisa melanjutkan dari perangkat lain.",
  ],
  [
    "Apakah hasil gambar akan sama dengan contoh?",
    "Contoh adalah ilustrasi yang dibuat memakai generator gambar eksternal. Hasil dapat berbeda menurut model, versi, pengaturan, dan gambar referensi yang kamu gunakan.",
  ],
];

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [demo, setDemo] = useState("product");
  const [filter, setFilter] = useState("all");
  const { user, notify } = useSite();
  const selected = LOOKS.find((l) => l.id === demo)!;
  return (
    <div className="landing">
      <header className="public-header">
        <div className="container nav-inner">
          <Brand />
          <nav
            className={menu ? "public-nav nav-open" : "public-nav"}
            aria-label="Navigasi utama"
          >
            {[
              ["Fitur", "#fitur"],
              ["Contoh", "#contoh"],
              ["Cara Kerja", "#cara-kerja"],
              ["Harga", "#harga"],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
            <a href="#faq" onClick={() => setMenu(false)}>
              FAQ
            </a>
          </nav>
          <div className="nav-actions">
            <ThemeToggle />
            <Link className="login-link" to={user?.active ? "/app" : "/masuk"}>
              {user?.active ? "Buka Studio" : "Masuk"}
              <ArrowUpRight size={15} />
            </Link>
            <PurchaseButton className="nav-cta">
              Mulai Berkreasi <ArrowUpRight size={15} />
            </PurchaseButton>
            <button
              className="icon-btn mobile-menu"
              aria-label={menu ? "Tutup menu" : "Buka menu"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main>
        <section className="hero container">
          <div className="hero-copy enter">
            <div className="eyebrow-pill">
              <span />
              DARI IDE DI KEPALA, JADI VISUAL BERCERITA
            </div>
            <h1>
              Gambar bagus
              <br />
              dimulai dari
              <br />
              <span className="highlight-word">
                prompt yang tepat.
                <svg viewBox="0 0 460 18" aria-hidden="true">
                  <path d="M4 12Q200-2 453 8M55 17Q230 5 420 13" />
                </svg>
              </span>
            </h1>
            <p className="hero-description">
              Punya ide keren? Racik jadi prompt yang terarah lewat pilihan
              visual. Tanpa pusing istilah teknis. Tanpa mulai dari nol.
            </p>
            <div className="hero-buttons">
              <PurchaseButton>
                Mulai Berkreasi <ArrowUpRight size={18} />
              </PurchaseButton>
              <a className="button button-quiet" href="#demo">
                <span className="play-icon">
                  <Play size={13} fill="currentColor" />
                </span>
                Lihat Cara Kerjanya
              </a>
            </div>
            <div className="hero-purchase">
              <span className="price-small">{PRICE_LABEL}</span>
              <span>sekali bayar</span>
              <i />
              <Check size={15} />
              <span>Akses lifetime + update mendatang</span>
            </div>
            <div className="hero-note">
              <span className="tiny-spark">✦</span> Kamu bawa idenya. Aichemy
              bantu meracik promptnya.
            </div>
          </div>
          <div
            className="hero-art enter delayed"
            aria-label="Contoh kemungkinan visual dengan prompt"
          >
            <div className="hero-orbit" />
            <div className="hero-doodle doodle-top">✳</div>
            <div className="hero-doodle doodle-bottom">✧</div>
            <div className="image-card card-portrait">
              <ExampleImage
                id="portrait"
                alt="Potret editorial dengan cahaya hangat"
                eager
              />
              <span>
                <span className="color-dot coral" />
                Potret penuh karakter
              </span>
            </div>
            <div className="image-card card-product">
              <ExampleImage
                id="product"
                alt="Contoh foto produk serum dengan komposisi kreatif"
                eager
              />
              <span>
                <span className="color-dot purple" />
                Produk jadi pusat perhatian
              </span>
            </div>
            <div className="image-card card-food">
              <ExampleImage
                id="food"
                alt="Contoh fotografi nasi goreng Indonesia"
                eager
              />
              <span>
                <span className="color-dot green" />
                Bikin lapar duluan
              </span>
            </div>
            <div className="floating-label">
              <Sparkles size={16} />
              Ide kamu. Kemungkinan baru.
            </div>
            <div className="cursor-tag">
              <MousePointer2 size={21} fill="#ff8066" />
              Kreativitasmu
            </div>
          </div>
        </section>
        <div className="compatibility container">
          <p>PROMPT-NYA DARI AICHEMY. GAMBAR-NYA DI APLIKASI PILIHANMU.</p>
          <div>
            <span>GPT Image</span>
            <span className="compat-plus">+</span>
            <span>Nano Banana</span>
            <span className="compat-plus">+</span>
            <span>
              dan model gambar favoritmu <ArrowUpRight size={17} />
            </span>
          </div>
          <small>Layanan gambar AI digunakan secara terpisah.</small>
        </div>

        <section className="section container" id="contoh">
          <div className="section-heading">
            <div>
              <div className="eyebrow">SEBELUM PROMPT, ADA SEBUAH IDE</div>
              <h2>
                Satu ide bisa punya
                <br />
                <span className="serif-accent">banyak kemungkinan.</span>
              </h2>
            </div>
            <p>
              Mulai dari tampilan yang kamu suka.
              <br />
              Lalu buat jadi benar-benar versimu.
            </p>
          </div>
          <div
            className="filter-row"
            role="group"
            aria-label="Filter contoh visual"
          >
            <button
              className={`chip ${filter === "all" ? "selected" : ""}`}
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              Semua contoh
            </button>
            {LOOKS.map((look) => (
              <button
                key={look.id}
                className={`chip ${filter === look.id ? "selected" : ""}`}
                aria-pressed={filter === look.id}
                onClick={() => setFilter(look.id)}
              >
                {look.short}
              </button>
            ))}
          </div>
          <div className="gallery-grid">
            {(filter === "all"
              ? LOOKS.slice(0, 6)
              : LOOKS.filter((l) => l.id === filter)
            ).map((look, i) => (
              <Link
                to={
                  user?.active ? `/app/studio/${look.id}?starter=1` : "/daftar"
                }
                className={`gallery-card gallery-${i}`}
                key={look.id}
              >
                <div className="gallery-image">
                  <ExampleImage id={look.id} alt={look.title} />
                  <span className="gallery-category">{look.label}</span>
                  <span className="gallery-open" aria-hidden="true">
                    <ArrowUpRight size={21} />
                  </span>
                </div>
                <div className="gallery-caption">
                  <h3>{look.title}</h3>
                  <span>
                    Jadikan versimu <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="example-disclosure">
            Ilustrasi dibuat dengan generator gambar eksternal. Hasil dapat
            berbeda sesuai model dan pengaturan.
          </p>
        </section>

        <section className="demo-section" id="demo">
          <div className="container demo-layout">
            <div className="demo-copy">
              <div className="eyebrow">KONTROL KREATIF, TANPA RIBET</div>
              <h2>
                Bukan tebak-tebakan.
                <br />
                <span className="serif-accent">Tinggal pilih, lalu racik.</span>
              </h2>
              <p>
                Kamu tidak harus tahu semua istilah fotografi. Lihat
                referensinya, pilih yang cocok, dan pahami apa yang berubah.
              </p>
              <ul className="check-list">
                <li>
                  <CheckCircle2 />
                  Pilihan visual yang mudah dipahami
                </li>
                <li>
                  <CheckCircle2 />
                  Prompt tersusun otomatis
                </li>
                <li>
                  <CheckCircle2 />
                  Bisa disunting sesuai seleramu
                </li>
              </ul>
              <PurchaseButton className="button-inline">
                Coba di Studiomu <ArrowUpRight size={17} />
              </PurchaseButton>
            </div>
            <div className="demo-window">
              <div className="window-bar">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>aichemy / ruang kreasi</span>
                <span className="demo-badge">DEMO</span>
              </div>
              <div className="demo-tabs">
                {["product", "portrait", "cinematic"].map((id) => (
                  <button
                    key={id}
                    onClick={() => setDemo(id)}
                    className={demo === id ? "active" : ""}
                  >
                    {LOOKS.find((l) => l.id === id)!.short}
                  </button>
                ))}
              </div>
              <div className="demo-body">
                <div className="demo-visual">
                  <ExampleImage key={demo} id={demo} alt={selected.title} />
                  <div className="ingredient-stack">
                    {selected.ingredients.map((ingredient, i) => (
                      <span key={ingredient}>
                        <span>0{i + 1}</span>
                        {ingredient}
                        <Check size={13} />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="demo-prompt">
                  <div className="prompt-label">
                    <Sparkles size={15} />
                    Prompt kamu<span>ENGLISH</span>
                  </div>
                  <p>{DEMO_PROMPTS[demo]}</p>
                  <button
                    className="button button-primary demo-copy-button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(DEMO_PROMPTS[demo]);
                        notify("Contoh prompt berhasil disalin.");
                      } catch {
                        notify("Salin manual teks contoh di atas.", true);
                      }
                    }}
                  >
                    <Copy size={15} />
                    Salin Contoh Prompt
                  </button>
                  <small>
                    Demo terkurasi · Studio lengkap tersedia untuk anggota
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section container" id="cara-kerja">
          <div className="center-heading">
            <div className="eyebrow">DARI “KAYAKNYA BAGUS” JADI “INI DIA!”</div>
            <h2>
              Ide di kepala.
              <br />
              <span className="serif-accent">Prompt siap dibawa.</span>
            </h2>
            <p>
              Empat langkah ringan untuk mengarahkan visual yang kamu bayangkan.
            </p>
          </div>
          <div className="steps-grid">
            {[
              [
                LayoutGrid,
                "01",
                "Pilih ruang kreasimu",
                "Mulai dari studio yang cocok atau contoh yang bikin kamu terinspirasi.",
              ],
              [
                Palette,
                "02",
                "Racik tampilannya",
                "Atur subjek, cahaya, komposisi, dan gaya lewat pilihan visual.",
              ],
              [
                SlidersHorizontal,
                "03",
                "Beri sentuhanmu",
                "Tinjau hasilnya. Tambahkan detail atau sunting kata-kata sampai terasa pas.",
              ],
              [
                Copy,
                "04",
                "Salin. Lalu ciptakan.",
                "Tempel prompt di GPT Image, Nano Banana, atau aplikasi gambar pilihanmu.",
              ],
            ].map(([Icon, number, title, text]) => {
              const StepIcon = Icon as typeof Copy;
              return (
                <div className="step-card" key={String(number)}>
                  <div className="step-top">
                    <span>{String(number)}</span>
                    <StepIcon size={26} />
                  </div>
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="section feature-section" id="fitur">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">RUANG UNTUK SEMUA IDEMU</div>
                <h2>
                  Mudah untuk mulai.
                  <br />
                  <span className="serif-accent">
                    Luas untuk bereksplorasi.
                  </span>
                </h2>
              </div>
              <div className="feature-sticker">
                10
                <br />
                <small>STUDIO KREATIF</small>
                <Sparkles size={22} />
              </div>
            </div>
            <div className="features-grid">
              {features.map(([Icon, title, text], i) => (
                <article key={title} className="feature-card">
                  <div className={`feature-icon tone-${i % 3}`}>
                    <Icon size={23} />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <div className="audience-row">
              <span>UNTUK IDE BESAR DARI</span>
              {[
                "Pemilik UMKM",
                "Kreator konten",
                "Penjual online",
                "Desainer",
                "Fotografer",
              ].map((label) => (
                <span className="audience-chip" key={label}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section container relight-section">
          <div className="relight-art">
            <div>
              <ExampleImage
                id="relight-before"
                alt="Potret sumber dengan pencahayaan netral"
              />
              <span>Sebelum</span>
            </div>
            <div>
              <ExampleImage
                id="relight"
                alt="Ilustrasi potret yang sama dengan cahaya keemasan"
              />
              <span>Setelah diarahkan ulang</span>
            </div>
            <div className="relight-arrow">
              <ArrowRight />
            </div>
          </div>
          <div>
            <div className="eyebrow">DETAIL KECIL, PERUBAHAN BESAR</div>
            <h2>
              Subjeknya sama.
              <br />
              <span className="serif-accent">Ceritanya berbeda.</span>
            </h2>
            <p>
              Jelajahi pengaruh cahaya, arah, dan nuansa warna lewat studio
              Relight. Susun arahan yang jelas sebelum mengedit foto di aplikasi
              AI pilihanmu.
            </p>
            <div className="ingredient-pills">
              <span>Cahaya keemasan</span>
              <span>Identitas dipertahankan</span>
              <span>Suasana hangat</span>
            </div>
            <p className="example-disclosure">
              Ilustrasi edit dengan generator eksternal, bukan hasil render
              langsung dari Aichemy.
            </p>
          </div>
        </section>

        <section className="pricing-section" id="harga">
          <div className="container pricing-layout">
            <div className="pricing-copy">
              <div className="eyebrow">
                LEBIH BANYAK KREASI. SATU KALI INVESTASI.
              </div>
              <h2>
                Bayar sekali.
                <br />
                Racik ide
                <br />
                <span className="serif-accent">berkali-kali.</span>
              </h2>
              <p>
                Satu tempat untuk semua arah visualmu.
                <br />
                Tanpa tagihan langganan Aichemy.
              </p>
              <div className="pricing-doodle">
                ✳{" "}
                <span>
                  Ruang kreatifmu,
                  <br />
                  untuk perjalanan panjang.
                </span>
              </div>
            </div>
            <div className="price-card">
              <div className="price-card-heading">
                <span className="pill">
                  <Sparkles size={14} />
                  AKSES LIFETIME
                </span>
                <span>Satu akun pribadi</span>
              </div>
              <div className="price-amount">
                {PRICE_LABEL}
                <span>sekali bayar</span>
              </div>
              <p>
                Tanpa tanggal kedaluwarsa.
                <br />
                Termasuk pembaruan fitur mendatang.
              </p>
              <div className="price-divider" />
              <ul className="check-list">
                {[
                  "Seluruh 10 studio prompt builder",
                  "Katalog pilihan visual & contoh starter",
                  "Preset, favorit, dan draft lintas perangkat",
                  "Studio kustom untuk alur kerjamu",
                  "Sunting, undo, salin, dan ekspor prompt",
                  "Pembaruan fitur Aichemy mendatang",
                ].map((text) => (
                  <li key={text}>
                    <Check size={17} />
                    {text}
                  </li>
                ))}
              </ul>
              <PurchaseButton>
                Dapatkan Akses Lifetime <ArrowUpRight size={19} />
              </PurchaseButton>
              <div className="price-trust">
                <ShieldCheck size={15} />
                Akun pribadi · Sekali bayar · Tanpa langganan
              </div>
              <small>
                Biaya aplikasi pembuat gambar eksternal tidak termasuk.
              </small>
            </div>
          </div>
        </section>

        <section className="section container faq-section" id="faq">
          <div>
            <div className="eyebrow">MASIH PENASARAN?</div>
            <h2>
              Pertanyaan bagus.
              <br />
              <span className="serif-accent">Jawaban jelas.</span>
            </h2>
            <p>Biar kamu tahu persis apa yang kamu dapat.</p>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing-section container">
          <div className="closing-spark">✦</div>
          <div className="eyebrow">IDE BERIKUTNYA SUDAH MENUNGGU</div>
          <h2>
            Yuk, bikin sesuatu
            <br />
            yang <span className="serif-accent">kamu banget.</span>
          </h2>
          <PurchaseButton>
            Mulai Berkreasi — {PRICE_LABEL} <ArrowUpRight size={18} />
          </PurchaseButton>
        </section>
      </main>
      <footer className="public-footer">
        <div className="container footer-top">
          <div>
            <Brand />
            <p>
              Tempat ide bertemu arah visual.
              <br />
              Dibuat untuk kreator Indonesia.
            </p>
          </div>
          <div>
            <span>JELAJAHI</span>
            <a href="#fitur">Fitur</a>
            <a href="#contoh">Contoh visual</a>
            <a href="#harga">Harga lifetime</a>
          </div>
          <div>
            <span>AKUN</span>
            <Link to="/masuk">Masuk</Link>
            <Link to="/daftar">Buat akun</Link>
            <Link to="/lupa-kata-sandi">Lupa kata sandi</Link>
          </div>
          <div>
            <span>INFORMASI</span>
            <Link to="/ketentuan">Ketentuan akses</Link>
            <Link to="/privasi">Privasi</Link>
            <Link to="/kontak">Kontak</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Aichemy. Semua ide dimulai dari kamu.
          </span>
          <span>Prompt builder · Bukan generator gambar</span>
        </div>
      </footer>
      <div className="mobile-purchase">
        <div>
          <strong>{PRICE_LABEL}</strong>
          <span>Sekali bayar · Lifetime</span>
        </div>
        <PurchaseButton>
          Mulai Sekarang <ArrowUpRight size={16} />
        </PurchaseButton>
      </div>
    </div>
  );
}
