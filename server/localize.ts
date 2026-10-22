import labels from "./locales/id.json";
export function studioLabel(
  studio: string,
  id: string,
  fallback: string,
): string {
  if (studio.startsWith("x-")) return fallback;
  return (
    (labels as Record<string, string>)[`${studio}.${id}`] ?? translate(fallback)
  );
}
const exact: Record<string, string> = {
  "Subject & Action": "Subjek & aktivitas",
  Environment: "Lingkungan",
  "Atmosphere / Mood": "Suasana yang diinginkan",
  "Shot Type / Angle": "Jenis foto & sudut",
  "Viewing Direction (Optional)": "Arah pandang (opsional)",
  "Aspect Ratio": "Rasio gambar",
  "Subject unaware of camera": "Subjek tidak menatap kamera",
  "Lighting Source": "Sumber cahaya",
  "Camera Body": "Bodi kamera",
  "Focal Length": "Panjang fokus",
  "Lens Type": "Jenis lensa",
  "F-Stop": "Bukaan lensa",
  "Film Stock": "Karakter film",
  "Photographer Style": "Gaya fotografer",
  "Movie Look / Aesthetic": "Nuansa film",
  "Filter / Effect": "Filter & efek",
  "Subject & Framing": "Subjek & komposisi",
  "Lighting & Mood": "Cahaya & suasana",
  "Camera Gear": "Peralatan kamera",
  "Style & Aesthetics": "Gaya & estetika",
  "Product name / description": "Nama & deskripsi produk",
  "Product & Category": "Produk & kategori",
  "Props & Composition": "Properti & komposisi",
  "Props & styling (select to override category defaults)":
    "Properti & penataan (opsional)",
  "Negative space for ad copy": "Sisakan ruang untuk teks iklan",
  "Blank label (no text)": "Label produk kosong tanpa teks",
  "Lens & Framing": "Lensa & komposisi",
  "Wardrobe & Expression": "Pakaian & ekspresi",
  "Background & Setting": "Latar & tempat",
  "Logo Type": "Jenis logo",
  "Shape & Lockup": "Bentuk & susunan",
  "Icon & Technique": "Ikon & teknik",
  "Brand brief": "Deskripsi merek",
  "Icon motif": "Objek atau simbol ikon",
  "Lighting Setup": "Pengaturan cahaya",
  "Studio Lighting": "Cahaya studio",
  "Surface & Background": "Permukaan & latar",
  "Camera & Lens": "Kamera & lensa",
  "Hero shot": "Foto unggulan",
  "White sweep (seamless)": "Putih tanpa batas",
  "Colored paper / solid backdrop": "Kertas warna / latar polos",
  "Softbox diffused": "Softbox lembut",
  "Natural window light": "Cahaya alami jendela",
  "Golden hour": "Cahaya keemasan",
  Presentation: "Penyajian",
  "Publication style": "Gaya publikasi",
  "Backdrop & Props": "Latar & properti",
  "Light Mood": "Cahaya & suasana",
  "Light mood": "Cahaya & suasana",
  "Camera & Style": "Kamera & gaya",
  "Skincare & Beauty": "Perawatan kulit & kecantikan",
  "Food & Beverage": "Makanan & minuman",
  "Fashion & Accessories": "Busana & aksesori",
};
// Stable internal values and prompt phrases remain English. Only presentation labels change.
const pairs =
  "subject=subjek|action=aktivitas|framing=komposisi|lighting=pencahayaan|light=cahaya|mood=suasana|camera=kamera|body=bodi|lens=lensa|background=latar|setting=tempat|wardrobe=pakaian|expression=ekspresi|portrait=potret|type=jenis|photographer=fotografer|designer=desainer|style=gaya|shot=foto|angle=sudut|category=kategori|surface=permukaan|props=properti|composition=komposisi|quality=kualitas|construction=konstruksi|techniques=teknik|technique=teknik|lettering=huruf|brand=merek|industry=industri|shape=bentuk|color=warna|colour=warna|palette=palet|typography=tipografi|motif=motif|icon=ikon|reference=referensi|photo=foto|mode=mode|direction=arah|intensity=intensitas|temperature=temperatur|contrast=kontras|saturation=saturasi|highlights=sorotan|shadows=bayangan|grain=butiran|face=wajah|skin=kulit|document=dokumen|formal=formal|size=ukuran|ratio=rasio|optional=opsional|natural=alami|warm=hangat|cool=dingin|soft=lembut|hard=tegas|dramatic=dramatis|cinematic=sinematik|beauty=kecantikan|clean=bersih|white=putih|black=hitam|red=merah|blue=biru|green=hijau|yellow=kuning|orange=jingga|purple=ungu|pink=merah muda|gray=abu-abu|grey=abu-abu|dark=gelap|bright=terang|neutral=netral|seamless=tanpa batas|outdoor=luar ruang|indoor=dalam ruang|window=jendela|sunlight=matahari|sunset=senja|sunrise=fajar|overhead=dari atas|side=samping|front=depan|back=belakang|backlit=cahaya belakang|diffused=tersebar|direct=langsung|rim=tepi|reflective=reflektif|marble=marmer|wood=kayu|concrete=beton|stone=batu|fabric=kain|paper=kertas|gradient=gradasi|matte=doff|glossy=mengilap|floating=melayang|macro=makro|centered=tengah|symmetric=simetris|hero=unggulan|product=produk|skincare=perawatan kulit|food=makanan|beverage=minuman|fashion=busana|accessories=aksesori|jewelry=perhiasan|luxury=mewah|electronics=elektronik|home=rumah|goods=perlengkapan|other=lainnya|actor=aktor|headshot=potret kepala|stylized=bergaya|professional=profesional|casual=santai|smile=senyum|confident=percaya diri|serious=serius|relaxed=rileks|wedding=pernikahan|couple=pasangan|ceremony=upacara|reception=resepsi|moment=momen|venue=lokasi|attire=busana|dress=gaun|suit=setelan|traditional=tradisional|garden=taman|beach=pantai|forest=hutan|elegant=elegan|romantic=romantis|intimate=intim|room=ruang|property=properti|building=bangunan|staging=penataan|dish=hidangan|cuisine=kuliner|garnish=hiasan|plating=penyajian|steam=uap|restaurant=restoran|cafe=kafe|drinks=minuman|dessert=pencuci mulut|layout=tata letak|headline=judul|text=teks|strategy=strategi|position=posisi|accent=aksen|output=hasil|resolution=resolusi|preserve=pertahankan|replace=ganti|remove=hapus|people=orang|identity=identitas|strength=kekuatan|fill=pengisi|key=utama|split=terbelah|flat=datar|low=rendah|high=tinggi|eye=mata|level=sejajar|wide=lebar|close=dekat|up=atas|full=penuh|medium=sedang|tight=rapat|entire=seluruh|group=kelompok|view=pandangan|focus=fokus|depth=kedalaman|field=bidang|texture=tekstur|no=tanpa|and=dan|with=dengan|for=untuk|of=dari|in=di|on=pada|to=ke|minimalist=minimalis|simple=sederhana|geometric=geometris|abstract=abstrak|organic=organik|classic=klasik|playful=ceria|bold=tegas|delicate=halus|friendly=ramah|rough=kasar|smooth=halus|airy=lapang|misty=berkabut|rainy=hujan|cloudy=berawan|overcast=mendung|sunny=cerah|city=kota|street=jalanan|urban=perkotaan|environmental=lingkungan|photography=fotografi|daylight=cahaya siang|volumetric=volumetrik|teal=toska|monochrome=monokrom|metallic=metalik|gold=emas|silver=perak|cream=krem|beige=krem|brown=cokelat|navy=biru tua|olive=zaitun|emerald=zamrud|vivid=pekat|muted=lembut|vibrant=cerah|flash=lampu kilat|bounce=pantulan|balanced=seimbang|finish=hasil akhir|effect=efek|crop=potongan|crisp=tajam|sharp=tajam|dreamy=seperti mimpi|moody=dramatis|glow=pendar|realistic=realistis|photorealistic=fotorealistis|shallow=dangkal|deep=dalam|architectural=arsitektur|architecture=arsitektur|frame=bingkai|default=bawaan|auto=otomatis|none=tidak ada|custom=kustom|blank=kosong|negative=negatif|space=ruang|copy=teks iklan|backdrop=latar|tone=rona|clothing=pakaian|hat=topi|shirt=kemeja|jacket=jaket|blouse=blus|head=kepala|shoulders=bahu|waist=pinggang|chest=dada|hands=tangan|standing=berdiri|seated=duduk|sitting=duduk|walking=berjalan|looking=melihat|sky=langit|horizon=cakrawala|water=air|droplets=tetesan|leaves=daun|botanical=botani|flowers=bunga|scattered=tersebar|ingredients=bahan|character=karakter|design=desain|wordmark=logo teks|emblem=emblem|mascot=maskot|lettermark=monogram|combination=kombinasi|lockup=susunan|stacked=bertumpuk|circle=lingkaran|square=persegi|rounded=membulat|script=tulisan tangan|handwritten=tulisan tangan|line=garis|outline=garis luar|solid=polos|vector=vektor|ink=tinta|print=cetak|art=seni|creative=kreatif|commercial=komersial|ad=iklan|sale=penjualan|offer=penawaran|rendering=penulisan|exact=persis|leave=sisakan|empty=kosong|safe=aman|area=area|content=konten|placement=penempatan|sharpness=ketajaman|blur=kabur|motion=gerak|movement=gerakan|static=statis|dynamic=dinamis|exposure=eksposur|brightness=kecerahan|scratches=goresan|dust=debu|aged=tua|faded=pudar|required=diperlukan|all=semua|select=pilih|choose=pilih|use=gunakan|override=ganti|defaults=bawaan|gentle=lembut|subtle=halus|even=merata|materials=material|colors=warna|colours=warna|clarity=kejernihan|candid=spontan|relight=pencahayaan ulang|relighting=pencahayaan ulang|grade=gradasi|grading=gradasi|scene=adegan|object=objek|person=orang|facial=wajah|foreground=latar depan|rule=aturan|thirds=sepertiga|perspective=perspektif|image=gambar|context=konteks|lifestyle=gaya hidup|packshot=foto kemasan|scale=skala|top=atas|down=bawah|straight=lurus|levitation=melayang|sweep=latar|glamour=glamor|documentary=dokumenter|environment=lingkungan|closeup=jarak dekat|upper=atas|family=keluarga|woman=perempuan|man=pria|male=pria|female=perempuan|happy=bahagia|joyful=ceria|thoughtful=merenung|office=kantor|park=taman|rustic=rustik|photographic=fotografis|illustration=ilustrasi|table=meja|wooden=kayu|board=papan|gloss=kilau|fabric=kain|wrinkles=kerutan|shadow=bayangan|reflections=pantulan|setting=tempat|warmth=kehangatan|material=material|sharpness=ketajaman|lighting=pencahayaan|studio=studio|setup=pengaturan";
const words: Record<string, string> = Object.fromEntries(
  pairs.split("|").map((pair) => pair.split("=")),
);
export function translate(text: string): string {
  const clean = text.replace(/^\d+[. ·—-]+\s*/, "");
  const result =
    exact[clean] ??
    clean
      .replace(/[A-Za-z]+/g, (token) => words[token.toLowerCase()] ?? token)
      .replace(/\s+/g, " ")
      .trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}
