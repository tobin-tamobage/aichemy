// Keep structural paths stable for advanced editors; explain problems in Indonesian.
export function recipeError(message: string): string {
  const phrases: [RegExp, string][] = [
    [/non-empty string required/g, "wajib diisi dengan teks"],
    [/non-empty field key required/g, "kunci kolom wajib diisi"],
    [/at least 1 option required/g, "tambahkan setidaknya satu pilihan"],
    [
      /at least 1 prompt block required/g,
      "tambahkan setidaknya satu blok prompt",
    ],
    [/must be an object/g, "harus berupa objek data"],
    [/must be an array/g, "harus berupa daftar"],
    [/must be a string/g, "harus berupa teks"],
    [/must be a boolean/g, "harus bernilai benar atau salah"],
    [
      /must be an option value \(string\)/g,
      "harus sama dengan nilai salah satu pilihan",
    ],
    [/is not one of the option values/g, "tidak ada dalam daftar pilihan"],
    [/duplicate option value/g, "nilai pilihan berulang"],
    [/duplicate field key/g, "kunci kolom berulang"],
    [/unknown field key/g, "kunci kolom tidak ditemukan"],
    [/unknown section id/g, "bagian tidak ditemukan"],
    [/must be one of/g, "pilih salah satu dari"],
    [
      /toggle clause \(non-empty string\) required/g,
      "isi kalimat prompt saat sakelar aktif",
    ],
    [/integer >= 1 required/g, "isi bilangan bulat minimal 1"],
    [/must start with/g, "harus diawali dengan"],
    [/must be/g, "harus berupa"],
    [/required/g, "wajib diisi"],
  ];
  return phrases.reduce(
    (text, [pattern, translation]) => text.replace(pattern, translation),
    message,
  );
}
