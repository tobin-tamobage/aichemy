import React, { useEffect, useRef, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Moon,
  Sun,
  X,
  Sparkles,
  Shirt,
  Monitor,
  Diamond,
  Camera,
  Layers,
  Flower2,
  Palette,
  PersonStanding,
} from "lucide-react";
import { useSite } from "./context";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Aichemy — beranda"
    >
      <img
        src="/assets/brand/mark-64.png"
        srcSet="/assets/brand/mark-64.png 1x, /assets/brand/mark-192.png 3x"
        width="38"
        height="38"
        alt=""
      />
      <span>
        aichemy<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function ThemeToggle() {
  const { dark, toggleTheme } = useSite();
  return (
    <button
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={`Gunakan tema ${dark ? "terang" : "gelap"}`}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
export function PurchaseButton({
  className = "",
  children = (
    <>
      Dapatkan Akses Lifetime <ArrowUpRight size={18} />
    </>
  ),
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { user } = useSite();
  return (
    <Link
      className={`button button-primary ${className}`}
      to={user?.active ? "/app" : user ? "/checkout" : "/daftar"}
    >
      {user?.active ? (
        <>
          Buka Studio <ArrowUpRight size={18} />
        </>
      ) : (
        children
      )}
    </Link>
  );
}
export function ExampleImage({
  id,
  alt,
  className = "",
  eager = false,
}: {
  id: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      className={className}
      src={`/assets/examples/${id}.webp`}
      srcSet={`/assets/examples/${id}-small.webp 450w, /assets/examples/${id}.webp 900w`}
      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 420px"
      width="900"
      height="1125"
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
  initialFocus = "form",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
  initialFocus?: "form" | "close";
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(
    typeof document !== "undefined"
      ? (document.activeElement as HTMLElement)
      : null,
  );
  const id = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = previousFocus.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const node = dialog.current;
    node?.showModal();
    node
      ?.querySelector<HTMLElement>(
        initialFocus === "close"
          ? 'button[aria-label="Tutup dialog"]'
          : 'input:not([type="hidden"]), textarea, select',
      )
      ?.focus();
    return () => {
      node?.close();
      document.body.style.overflow = overflow;
      queueMicrotask(() => {
        if (previous?.isConnected) previous.focus({ preventScroll: true });
      });
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby={id}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        closeRef.current();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const nodes = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]',
          ),
        ].filter(
          (node) =>
            node.getClientRects().length &&
            node.getAttribute("type") !== "hidden",
        );
        const first = nodes[0];
        const last = nodes.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target === dialog.current) closeRef.current();
      }}
    >
      <div className="modal-heading">
        <h2 id={id}>{title}</h2>
        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Tutup dialog"
        >
          <X size={20} />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>,
    document.body,
  );
}
export function Confirm({
  title,
  description,
  action = "Hapus",
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  action?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="muted">{description}</p>
      <div className="button-row end">
        <button className="button button-secondary" onClick={onClose}>
          Batal
        </button>
        <button className="button button-danger" onClick={onConfirm}>
          {action}
        </button>
      </div>
    </Modal>
  );
}
export function ImageTile({
  src,
  label,
  group = "",
}: {
  src?: string;
  label: string;
  group?: string;
}) {
  const [failed, setFailed] = useState(false);
  const name = label.toLowerCase();
  const category = /category|categoryId|cuisine|roomType/i.test(group);
  const example = category
    ? /kulit|kecantikan/.test(name)
      ? "product"
      : /makanan|minuman|kuliner/.test(name)
        ? "food"
        : /interior|ruang tamu/.test(name)
          ? "real-estate"
          : undefined
    : undefined;
  const image =
    src ?? (example ? `/assets/examples/${example}-small.webp` : undefined);
  const Icon = /cahaya|lighting|light/.test(group + name)
    ? Sun
    : /pakaian|busana|kemeja|gaun/.test(name)
      ? Shirt
      : /elektronik/.test(name)
        ? Monitor
        : /perhiasan/.test(name)
          ? Diamond
          : /camera|lens|kamera|lensa/.test(group + name)
            ? Camera
            : /botani|bunga|daun/.test(name)
              ? Flower2
              : /palette|color|warna|palet/.test(group + name)
                ? Palette
                : /pose|framing|shotType/.test(group)
                  ? PersonStanding
                  : /surface|background|permukaan|latar/.test(group + name)
                    ? Layers
                    : Sparkles;
  const tint =
    [...label].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
  return image && !failed ? (
    <img
      src={image}
      alt=""
      loading="lazy"
      width="240"
      height="180"
      onError={() => setFailed(true)}
    />
  ) : (
    <span className={`tile-fallback tile-tint-${tint}`} aria-hidden="true">
      <span className="tile-orbit" />
      <Icon size={32} strokeWidth={1.3} />
    </span>
  );
}
