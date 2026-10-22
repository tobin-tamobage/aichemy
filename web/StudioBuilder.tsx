import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import type { CustomField, CustomRecipe } from "../domains/custom/types";
import type { LibraryItem } from "../shared/product";
import { api, post } from "./api";
import { Confirm, Modal } from "./ui";
import { useSite } from "./context";
const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
function newRecipe(): CustomRecipe {
  return {
    recipeVersion: 1,
    id: `x-studio-${crypto.randomUUID().slice(0, 6)}`,
    label: "",
    tagline: "",
    icon: "✦",
    sections: [
      {
        id: "idea",
        title: "Ide utama",
        fields: [
          {
            key: "subject",
            label: "Subjek",
            kind: "textarea",
            placeholder: "Apa yang ingin kamu buat?",
          },
        ],
      },
    ],
    template: [
      {
        kind: "field",
        field: "subject",
        prefix: "Create an image of ",
        suffix: ".",
      },
    ],
    presetProtectedKeys: ["subject"],
  };
}
export function CustomStudio({
  sourceId,
  initial,
  onClose,
  onSaved,
}: {
  sourceId?: string;
  initial?: LibraryItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { notify } = useSite();
  const [recipe, setRecipe] = useState<CustomRecipe>(
    () => (initial?.data.recipe as CustomRecipe) ?? newRecipe(),
  );
  const [step, setStep] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [advancedText, setAdvancedText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [valid, setValid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [changed, setChanged] = useState(false);
  useEffect(() => {
    if (sourceId)
      api<{ recipe: CustomRecipe }>(`/studios/${sourceId}/template`)
        .then((r) => setRecipe(r.recipe))
        .catch((e) => notify(e.message, true));
  }, [sourceId]);
  useEffect(() => {
    let current = true;
    const timer = setTimeout(
      () =>
        post<{ valid: boolean; errors?: string[]; prompt?: string }>(
          "/custom-preview",
          { recipe },
        )
          .then((r) => {
            if (current) {
              setValid(r.valid);
              setErrors(r.errors ?? []);
              setPrompt(r.prompt ?? "");
            }
          })
          .catch((e) => {
            if (current) setErrors([e.message]);
          }),
      400,
    );
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [recipe]);
  const update = (next: CustomRecipe) => {
    setRecipe(next);
    setChanged(true);
  };
  const close = () => (changed ? setDiscard(true) : onClose());
  function setField(
    sectionIndex: number,
    fieldIndex: number,
    patch: Partial<CustomField>,
  ) {
    update({
      ...recipe,
      sections: recipe.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              fields: s.fields.map((f, fi) =>
                fi === fieldIndex ? { ...f, ...patch } : f,
              ),
            }
          : s,
      ),
    });
  }
  async function save() {
    setBusy(true);
    try {
      await api(`/library/${initial?.id ?? crypto.randomUUID()}`, {
        method: "PUT",
        body: JSON.stringify({
          kind: "studio",
          studioId: recipe.id,
          name: recipe.label,
          data: { recipe },
        }),
      });
      notify("Studio pribadi berhasil disimpan.");
      onSaved();
    } catch (e) {
      notify((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Modal
        title={initial ? "Sunting studio pribadi" : "Buat ruang kreasimu"}
        onClose={close}
        wide
      >
        <div className="builder-step-nav">
          {["Dasar", "Pilihan", "Tinjau"].map((label, i) => (
            <button
              key={label}
              className={step === i ? "active" : ""}
              onClick={() => setStep(i)}
            >
              <span>{i + 1}</span>
              {label}
            </button>
          ))}
        </div>
        {step === 0 && (
          <div className="form-grid">
            <label className="form-label">
              Nama studio
              <input
                value={recipe.label}
                onChange={(e) => update({ ...recipe, label: e.target.value })}
                placeholder="Misalnya: Foto kopi andalan"
                maxLength={100}
              />
            </label>
            <label className="form-label">
              Deskripsi singkat
              <textarea
                value={recipe.tagline}
                onChange={(e) => update({ ...recipe, tagline: e.target.value })}
                placeholder="Studio ini membantu kamu membuat apa?"
                rows={3}
              />
            </label>
            <label className="form-label">
              ID studio
              <input
                value={recipe.id}
                disabled={Boolean(initial)}
                onChange={(e) => update({ ...recipe, id: e.target.value })}
              />
              <small>
                Awali dengan x-, gunakan huruf kecil dan tanda hubung.
              </small>
            </label>
            <p className="field-note">
              Mulai dengan nama dan deskripsi. Di tahap berikutnya, tentukan
              pilihan yang akan membentuk prompt.
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="custom-sections">
            {recipe.sections.map((section, si) => (
              <section className="custom-section" key={si}>
                <label className="form-label">
                  Nama bagian
                  <input
                    value={section.title}
                    onChange={(e) =>
                      update({
                        ...recipe,
                        sections: recipe.sections.map((s, i) =>
                          i === si ? { ...s, title: e.target.value } : s,
                        ),
                      })
                    }
                  />
                </label>
                {section.fields.map((field, fi) => (
                  <div className="custom-field" key={fi}>
                    <div className="custom-field-head">
                      <strong>Pilihan {fi + 1}</strong>
                      <button
                        className="icon-btn"
                        aria-label={`Hapus kolom ${field.label}`}
                        onClick={() =>
                          update({
                            ...recipe,
                            sections: recipe.sections.map((s, i) =>
                              i === si
                                ? {
                                    ...s,
                                    fields: s.fields.filter((_, j) => j !== fi),
                                  }
                                : s,
                            ),
                            template: recipe.template.filter(
                              (b) =>
                                b.kind !== "field" || b.field !== field.key,
                            ),
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="two-col">
                      <label className="form-label">
                        Label
                        <input
                          value={field.label}
                          onChange={(e) =>
                            setField(si, fi, { label: e.target.value })
                          }
                        />
                      </label>
                      <label className="form-label">
                        Kunci kolom
                        <input
                          value={field.key}
                          onChange={(e) => {
                            const key = e.target.value.replace(
                              /[^A-Za-z0-9_]/g,
                              "",
                            );
                            const old = field.key;
                            update({
                              ...recipe,
                              sections: recipe.sections.map((s, i) =>
                                i === si
                                  ? {
                                      ...s,
                                      fields: s.fields.map((f, j) =>
                                        j === fi ? { ...f, key } : f,
                                      ),
                                    }
                                  : s,
                              ),
                              template: recipe.template.map((b) =>
                                b.kind === "field" && b.field === old
                                  ? { ...b, field: key }
                                  : b,
                              ),
                              presetProtectedKeys:
                                recipe.presetProtectedKeys?.map((k) =>
                                  k === old ? key : k,
                                ),
                            });
                          }}
                        />
                      </label>
                    </div>
                    <label className="form-label">
                      Jenis isian
                      <select
                        value={field.kind}
                        onChange={(e) => {
                          const kind = e.target.value as CustomField["kind"];
                          setField(si, fi, {
                            kind,
                            default: undefined,
                            ...(kind === "select" || kind === "chips"
                              ? {
                                  options: field.options ?? [
                                    {
                                      label: "Pilihan pertama",
                                      value: "first",
                                      promptPhrase: "soft natural light",
                                    },
                                  ],
                                }
                              : {}),
                            ...(kind === "toggle"
                              ? { text: "Add soft natural light." }
                              : {}),
                          });
                        }}
                      >
                        <option value="textarea">Teks bebas</option>
                        <option value="select">Satu pilihan</option>
                        <option value="chips">Beberapa pilihan</option>
                        <option value="toggle">Sakelar</option>
                      </select>
                    </label>
                    {(field.kind === "select" || field.kind === "chips") && (
                      <div className="custom-options">
                        <span className="form-label">Pilihan visual</span>
                        {field.options?.map((option, oi) => (
                          <div className="custom-option-row" key={oi}>
                            <input
                              aria-label="Label pilihan"
                              value={option.label}
                              placeholder="Label Indonesia"
                              onChange={(e) =>
                                setField(si, fi, {
                                  options: field.options!.map((o, i) =>
                                    i === oi
                                      ? { ...o, label: e.target.value }
                                      : o,
                                  ),
                                })
                              }
                            />
                            <input
                              aria-label="Frasa prompt Inggris"
                              value={option.promptPhrase ?? ""}
                              placeholder="English prompt phrase"
                              onChange={(e) =>
                                setField(si, fi, {
                                  options: field.options!.map((o, i) =>
                                    i === oi
                                      ? { ...o, promptPhrase: e.target.value }
                                      : o,
                                  ),
                                })
                              }
                            />
                            <button
                              className="icon-btn"
                              aria-label="Hapus pilihan"
                              onClick={() =>
                                setField(si, fi, {
                                  options: field.options!.filter(
                                    (_, i) => i !== oi,
                                  ),
                                })
                              }
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          className="text-button"
                          onClick={() =>
                            setField(si, fi, {
                              options: [
                                ...(field.options ?? []),
                                {
                                  value: `option-${crypto.randomUUID().slice(0, 6)}`,
                                  label: "",
                                  promptPhrase: "",
                                },
                              ],
                            })
                          }
                        >
                          <Plus size={14} />
                          Tambah Pilihan
                        </button>
                      </div>
                    )}
                    {field.kind === "toggle" && (
                      <label className="form-label">
                        Kalimat saat aktif (Inggris)
                        <input
                          value={field.text ?? ""}
                          onChange={(e) =>
                            setField(si, fi, { text: e.target.value })
                          }
                        />
                      </label>
                    )}
                  </div>
                ))}
                <button
                  className="button button-secondary"
                  onClick={() => {
                    const key = `field_${crypto.randomUUID().slice(0, 6)}`;
                    update({
                      ...recipe,
                      sections: recipe.sections.map((s, i) =>
                        i === si
                          ? {
                              ...s,
                              fields: [
                                ...s.fields,
                                {
                                  key,
                                  label: "Pilihan baru",
                                  kind: "textarea",
                                },
                              ],
                            }
                          : s,
                      ),
                      template: [
                        ...recipe.template,
                        { kind: "field", field: key, suffix: "." },
                      ],
                    });
                  }}
                >
                  <Plus size={15} />
                  Tambah Kolom
                </button>
              </section>
            ))}
            <button
              className="button button-secondary"
              onClick={() =>
                update({
                  ...recipe,
                  sections: [
                    ...recipe.sections,
                    {
                      id: `section-${recipe.sections.length + 1}`,
                      title: "Bagian baru",
                      fields: [],
                    },
                  ],
                })
              }
            >
              <Plus size={15} />
              Tambah Bagian
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="review-studio">
            <h3>{recipe.label || "Studio tanpa nama"}</h3>
            <p className="muted">{recipe.tagline}</p>
            {valid ? (
              <div className="form-success">
                <Check size={16} />
                Studio siap disimpan.
              </div>
            ) : (
              <div className="form-error">
                <strong>Periksa konfigurasi studio:</strong>
                <ul>
                  {errors.slice(0, 12).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="prompt-document">
              <h4>Pratinjau prompt bawaan</h4>
              <p>
                {prompt ||
                  "Lengkapi nama, deskripsi, dan pilihan untuk melihat hasil prompt."}
              </p>
            </div>
            <button
              className="advanced-toggle"
              onClick={() => {
                setAdvanced(!advanced);
                setAdvancedText(
                  JSON.stringify(
                    {
                      template: recipe.template,
                      rules: recipe.rules ?? [],
                      presetProtectedKeys: recipe.presetProtectedKeys ?? [],
                    },
                    null,
                    2,
                  ),
                );
              }}
              aria-expanded={advanced}
            >
              <SlidersIcon />
              Template & aturan lanjutan
              <ChevronDown size={16} />
            </button>
            {advanced && (
              <label className="form-label">
                Konfigurasi lanjutan (JSON)
                <textarea
                  className="code-editor"
                  rows={12}
                  value={advancedText}
                  onChange={(e) => {
                    setAdvancedText(e.target.value);
                    try {
                      const parsed = JSON.parse(e.target.value);
                      update({
                        ...recipe,
                        template: parsed.template,
                        rules: parsed.rules,
                        presetProtectedKeys: parsed.presetProtectedKeys,
                      });
                    } catch {
                      setErrors(["Format JSON belum valid."]);
                      setValid(false);
                    }
                  }}
                />
                <small>
                  Template menyusun frasa prompt. Aturan dan daftar kolom
                  terlindungi dipertahankan saat studio disunting.
                </small>
              </label>
            )}
          </div>
        )}
        <div className="builder-bottom">
          <button
            className="button button-secondary"
            onClick={() => (step ? setStep(step - 1) : close())}
          >
            <ArrowLeft size={15} />
            {step ? "Sebelumnya" : "Batal"}
          </button>
          {step < 2 ? (
            <button
              className="button button-primary"
              onClick={() => setStep(step + 1)}
            >
              Lanjut <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="button button-primary"
              disabled={!valid || busy}
              onClick={save}
            >
              <Save size={16} />
              {busy ? "Menyimpan…" : "Simpan Studio"}
            </button>
          )}
        </div>
      </Modal>
      {discard && (
        <Confirm
          title="Tutup tanpa menyimpan?"
          description="Perubahan studio ini belum disimpan. Kamu bisa kembali menyunting sebelum menutup."
          action="Tutup Editor"
          onClose={() => setDiscard(false)}
          onConfirm={onClose}
        />
      )}
    </>
  );
}
function SlidersIcon() {
  return <span aria-hidden="true">⚙</span>;
}
