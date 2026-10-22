import { DOMAINS } from "../domains";
import { translate } from "../server/localize";
import { readFile, writeFile } from "node:fs/promises";
const filename = new URL("../server/locales/id.json", import.meta.url);
const dictionary: Record<string, string> = JSON.parse(
  await readFile(filename, "utf8"),
);
for (const recipe of DOMAINS) {
  const defaults = recipe.createEmptyState();
  const fields = recipe.sections.flatMap((section) => section.fields);
  const states = [
    defaults,
    ...fields.flatMap((field) =>
      "options" in field
        ? (typeof field.options === "function"
            ? field.options(defaults)
            : field.options
          ).map((option) => ({ ...defaults, [field.key]: option.value }))
        : [],
    ),
  ];
  const add = (id: string, text: string) => {
    dictionary[`${recipe.id}.${id}`] ??= translate(text);
  };
  for (const section of recipe.sections) {
    add(`section.${section.id}`, section.title);
    for (const field of section.fields) {
      add(`field.${field.key}`, field.label);
      if ("hint" in field && field.hint) add(`hint.${field.key}`, field.hint);
      if ("options" in field)
        for (const state of states) {
          for (const option of typeof field.options === "function"
            ? field.options(state)
            : field.options) {
            add(`option.${field.key}.${option.value}`, option.label);
            if (option.hint)
              add(`optionHint.${field.key}.${option.value}`, option.hint);
          }
        }
    }
  }
  for (const state of states)
    for (const warning of recipe.warnings?.(state) ?? [])
      add(`warning.${warning.sectionId}.${warning.text}`, warning.text);
}
await writeFile(filename, JSON.stringify(dictionary, null, 2) + "\n");
console.log(
  `${Object.keys(dictionary).length} label Indonesia dipetakan ke ID stabil. Entri yang telah disunting tetap dipertahankan.`,
);
