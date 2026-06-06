export interface Active {
  name: string;
  pct?: string; // only set for the 1-3 hero actives
  mechanism: string;
  isHero?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  pathway: string;
  format: string;
  size: string;
  price: string;
  phase: 1 | 2;
  available: boolean;
  image: string;
  hoverImage?: string; // lifestyle/texture image shown on card hover
  video?: string; // per-SKU looping video
  heroActives: Active[];
  howToUse: string;
  fullInci: string;
  description: string;
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "neurovectrix-core",
    slug: "neurovectrix-core",
    name: "NEUROVÉCTRIX™ Core",
    tagline: "Expression Line Modulator",
    pathway: "Neuromodulation",
    format: "White matte roll-on",
    size: "15ml",
    price: "$148.00 AUD",
    phase: 1,
    available: true,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/pywiLJtEPvxQgbHA.jpg",
    hoverImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/hover-neurovectrix-core-Tsqq54U4kv5tjUqhoZdWKb.png",
    badge: "Hero Product",
    description:
      "Topical neuromodulation for expression lines — no needles. NEUROVÉCTRIX™ Core inhibits the SNARE complex, attenuating the repetitive muscle contractions that cause dynamic expression lines. Clinical data: a '5 years younger-looking skin' effect was measured in 5 days by PRIMOS 3D microtopography.",
    heroActives: [
      { name: "SNAP-8™", pct: "10%", mechanism: "Inhibits SNARE complex formation to reduce neuronal exocytosis and muscle contraction", isHero: true },
      { name: "Argireline®", pct: "2%", mechanism: "Competes with SNAP-25 for Syntaxin 1A binding, attenuating neurotransmitter release", isHero: true },
      { name: "Matrixyl™ 3000", mechanism: "Stimulates collagen I, III, fibronectin, and hyaluronic acid synthesis in the dermis" },
      { name: "SYN®-COLL", mechanism: "Tripeptide that stimulates type I procollagen synthesis" },
      { name: "IDEALIFT™", mechanism: "Targets adipose tissue to improve facial volume and lifting effect" },
      { name: "Niacinamide", mechanism: "Supports barrier function, reduces inflammation, and improves skin tone" },
      { name: "HyaMatrix™ VII+", mechanism: "Seven-dimensional hyaluronic acid complex providing multi-depth hydration" },
    ],
    howToUse:
      "Apply to clean, dry skin. Roll directly onto expression lines (forehead, crow's feet, nasolabial folds). Allow 60 seconds to absorb before applying RECEPTORLIFT™. Use AM and PM. Avoid the eye contour — use NEUROVÉCTRIX™ Eye-Lift for the periocular area.",
    fullInci:
      "Aqua (Water), Glycerin, Acetyl Octapeptide-3 (SNAP-8™) 10%, Acetyl Hexapeptide-3 (Argireline®) 2%, Palmitoyl Tripeptide-1 / Palmitoyl Tetrapeptide-7 (Matrixyl™ 3000) 3%, Palmitoyl Tripeptide-5 (SYN®-COLL) 2.5%, Acetyl Dipeptide-1 Cetyl Ester (IDEALIFT™) 4%, Niacinamide 2%, Panthenol 2%, Sodium Hyaluronate (HyaMatrix™ VII+) 0.3%, Transcutol CG 2%, Propanediol 4%, Lecigel 0.2%, Hydrolite 5 Green 3%, Phenoxyethanol, Ethylhexylglycerin.",
  },
  {
    id: "receptorlift",
    slug: "receptorlift",
    name: "RECEPTORLIFT™",
    tagline: "Receptor-Level Firming Serum",
    pathway: "Receptor-level firming",
    format: "Airless pump",
    size: "30ml",
    price: "$162.00 AUD",
    phase: 1,
    available: true,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/RNxKSHBmcqfiFEGj.jpg",
    hoverImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/hover-receptorlift-3GAzxxTZafQJVcyRB6oWyV.png",
    description:
      "Receptor-level firming for loss of structure. RECEPTORLIFT™ targets the structural mechanisms of facial sagging through Progeline™, which remodels face contour by reducing progerin synthesis and increasing SIRT-1 and SIRT-3 levels.",
    heroActives: [
      { name: "Progeline™", pct: "2%", mechanism: "Remodels face contour with lifting and anti-sagging effect; reduces progerin synthesis; increases SIRT-1 and SIRT-3 levels", isHero: true },
      { name: "Kollaren™ BG", pct: "2%", mechanism: "Stimulates ECM proteins: collagen I & III, fibronectin, elastin, and laminin", isHero: true },
      { name: "ChroNOline™", mechanism: "Stimulates synthesis of anchoring components of the dermo-epidermal junction" },
      { name: "Matrixyl™ 3000", mechanism: "Stimulates collagen I, III, fibronectin, and hyaluronic acid synthesis" },
    ],
    howToUse:
      "Apply 1–2 pumps to face and neck after NEUROVÉCTRIX™ Core. Warm between fingertips and press gently into skin using upward strokes. Allow to absorb for 60 seconds. Use AM and PM.",
    fullInci:
      "Aqua (Water), Glycerin, Tripeptide-9 Citrulline (Progeline™) 2%, Acetyl Dipeptide-3 Aminohexanoate (ChroNOline™) 0.5%, Palmitoyl Tripeptide-1 / Palmitoyl Tetrapeptide-7 (Matrixyl™ 3000) 3%, Tripeptide-1 Copper (Kollaren™ BG) 2%, Panthenol 2%, Transcutol CG 2%, Propanediol 4%, Lecigel 0.2%, Hydrolite 5 Green 3%, Phenoxyethanol, Ethylhexylglycerin.",
  },
  {
    id: "stressdefense",
    slug: "stressdefense",
    name: "STRESSDEFENSE™",
    tagline: "Cellular Longevity Night Serum",
    pathway: "Cellular longevity / inflammaging",
    format: "Frosted glass dropper",
    size: "30ml",
    price: "$155.00 AUD",
    phase: 1,
    available: true,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/MvhlriicZdGxcHgV.jpg",
    hoverImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/hover-dermavectrix-P5YJr8v7dnL4LSGsK6oQmp.png",
    description:
      "Longevity peptides for stress-accelerated ageing. STRESSDEFENSE™ addresses inflammaging — the chronic, low-grade inflammation that accelerates structural aging. Nightessence™ optimises nocturnal skin repair including melatonin production and dark DNA damage repair.",
    heroActives: [
      { name: "Reproage", pct: "2%", mechanism: "Epigenetic anti-ageing; reduces DNA methylation age markers", isHero: true },
      { name: "Nightessence™", pct: "1%", mechanism: "Optimises nocturnal skin repair; supports melatonin production and dark DNA damage repair", isHero: true },
      { name: "Orsirtine ISR", mechanism: "Activates sirtuin pathways to extend cellular lifespan" },
      { name: "GP4G SP", mechanism: "Diadenosine tetraphosphate analogue; activates DNA repair mechanisms" },
      { name: "TRUREGEN", mechanism: "Stimulates cellular regeneration and reduces oxidative stress markers" },
    ],
    howToUse:
      "Apply 3–4 drops to clean skin in the PM routine after NEUROVÉCTRIX™ Core. Warm between fingertips and press gently into face and neck. Allow to fully absorb before applying DERMASHIELD™. PM use only.",
    fullInci:
      "Aqua (Water), Glycerin, Acetyl Tetrapeptide-11 (Reproage) 2%, Oryza Sativa (Rice) Extract (Orsirtine ISR) 1%, Diadenosine Tetraphosphate (GP4G SP) 1%, Lavandula Angustifolia (Lavender) Extract (Nightessence™) 1%, Saccharomyces Ferment Filtrate (TRUREGEN) 1%, Panthenol 2%, Transcutol CG 2%, Propanediol 4%, Lecigel 0.15%, Hydrolite 5 Green 3%, Phenoxyethanol, Ethylhexylglycerin.",
  },
  {
    id: "dermashield",
    slug: "dermashield",
    name: "DERMASHIELD™",
    tagline: "Barrier Renewal Moisturiser",
    pathway: "Barrier renewal",
    format: "Emulsified tube",
    size: "50ml",
    price: "$128.00 AUD",
    phase: 1,
    available: true,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/sfROLViThDuymYdD.jpg",
    hoverImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/hover-neurovectrix-barrier-fdm4zBqAiqECbnTjzcJ2Aj.png",
    description:
      "Neuro-soothing barrier repair for sensitised, over-treated skin. DERMASHIELD™ is the protocol's foundation layer. Neutrazen™ calms and soothes irritated skin by preventing neurogenic inflammation. Rosaliss™ uses Plant Small RNA Technology to activate skin self-repair markers.",
    heroActives: [
      { name: "Neutrazen™", pct: "2%", mechanism: "Prevents and reverses neurogenic inflammation; reduces vasodilation, oedema, and substance P-mediated inflammation", isHero: true },
      { name: "Rosaliss™", pct: "1%", mechanism: "PSR™ technology activates MARCKSL1 and miR-132 skin self-repair markers; stimulates collagen I, fibronectin, hyaluronic acid", isHero: true },
      { name: "Hyalorepair", mechanism: "High-molecular-weight hyaluronic acid for barrier-level hydration and repair" },
      { name: "Abyssine PF", mechanism: "Deep-sea extremophile extract; soothes and heals sensitised skin; pre/post-procedure recovery" },
      { name: "Ceramide Complex CLR", mechanism: "Replenishes skin ceramides to restore barrier integrity and prevent transepidermal water loss" },
    ],
    howToUse:
      "Apply as the final step in both AM and PM routines. Dispense a pea-sized amount and warm between fingertips. Press gently into face and neck. In the AM, follow with SPF. Suitable for sensitised, post-procedure, and compromised skin.",
    fullInci:
      "Aqua (Water), Glycerin, Acetyl Dipeptide-10 Citrulline (Neutrazen™) 2%, Rosa Canina Fruit Extract (Rosaliss™) 1%, Sodium Hyaluronate (Hyalorepair) 1%, Pseudoalteromonas Ferment Extract (Abyssine PF) 1%, Ceramide NP / Ceramide AP / Ceramide EOP (Ceramide Complex CLR) 1%, Panthenol 2%, Shea Butter, Transcutol CG 2%, Propanediol 4%, Lecigel 0.3%, Hydrolite 5 Green 3%, Phenoxyethanol, Ethylhexylglycerin.",
  },
  {
    id: "neurovectrix-eye",
    slug: "neurovectrix-eye",
    name: "NEUROVÉCTRIX™ Eye-Lift",
    tagline: "Periocular Neuromodulation Concentrate",
    pathway: "Periocular neuromodulation",
    format: "Ceramic-tipped roll-on",
    size: "10ml",
    price: "$118.00 AUD",
    phase: 2,
    available: false,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/DJdhUisuTRXmELJH.jpg",
    badge: "Coming Soon",
    description:
      "Precision periocular neuromodulation with a cooling ceramic tip. NEUROVÉCTRIX™ Eye-Lift addresses crow's feet, eyelid lifting, puffiness, and hydration. The ceramic-tipped applicator provides a cooling, hygienic delivery system for the delicate periocular area.",
    heroActives: [
      { name: "Uplevity™ e-Lift", pct: "2%", mechanism: "Eyelid lifting peptide; targets the upper eyelid area to reduce ptosis", isHero: true },
      { name: "Revital-Eyes™", pct: "5%", mechanism: "Periocular peptide complex; reduces crow's feet and dark circles", isHero: true },
      { name: "Eyeseryl™", mechanism: "Tetrapeptide that reduces periorbital oedema and puffiness" },
    ],
    howToUse:
      "Apply after NEUROVÉCTRIX™ Core in both AM and PM routines. Roll gently along the orbital bone — do not apply directly on the eyelid. The ceramic tip provides a cooling massage effect to reduce puffiness.",
    fullInci:
      "Aqua (Water), Glycerin, Acetyl Tetrapeptide-5 (Uplevity™ e-Lift) 2%, Palmitoyl Tetrapeptide-5 (Revital-Eyes™) 5%, Acetyl Tetrapeptide-5 (Eyeseryl™) 1%, Panthenol 2%, Transcutol CG 2%, Propanediol 4%, Lecigel 0.15%, Hydrolite 5 Green 3%, Phenoxyethanol, Ethylhexylglycerin.",
  },
  {
    id: "lipovectrix",
    slug: "lipovectrix",
    name: "LIPOVÉCTRIX™",
    tagline: "Contour & Jawline Concentrate",
    pathway: "Adipose modulation / contouring",
    format: "Precision pump",
    size: "20ml",
    price: "$178.00 AUD",
    phase: 2,
    available: false,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/GdCdyGFJEonqiLFU.jpg",
    badge: "Coming Soon",
    description:
      "Specialist contour concentrate for the jawline and lower face. LIPOVÉCTRIX™ uses Morpholys to inhibit PAI-1, reducing adipogenesis and limiting ECM disorganisation. SKINectura increases tenascin-X synthesis to rapidly decrease neck sagging.",
    heroActives: [
      { name: "Morpholys", pct: "2%", mechanism: "Inhibits PAI-1 to reduce adipogenesis and limit ECM disorganisation (Body Lipomorphing technology)", isHero: true },
      { name: "SKINectura", pct: "2%", mechanism: "Increases tenascin-X synthesis to rapidly decrease neck sagging", isHero: true },
      { name: "Progeline™", mechanism: "Remodels face contour; reduces progerin synthesis; increases SIRT-1 and SIRT-3" },
      { name: "Lanachrys 2B PF", mechanism: "Helichrysum extract; anti-inflammatory and skin-brightening for the lower face" },
      { name: "Body³ Complex", mechanism: "Multi-active complex targeting body contouring and skin firmness" },
    ],
    howToUse:
      "Apply 1 pump to the jawline, jowl area, and neck after your serum step. Use upward strokes from the décolletage to the jaw. Allow to absorb before moisturiser. PM use recommended for best results.",
    fullInci:
      "Aqua (Water), Glycerin, Tripeptide-9 Citrulline (Progeline™) 2%, Acetyl Hexapeptide-51 Amide (Morpholys) 2%, Helichrysum Italicum Flower Extract (Lanachrys 2B PF) 2%, Body³ Complex 1%, Acetyl Tetrapeptide-2 (SKINectura) 2%, Panthenol 2%, Transcutol CG 2%, Propanediol 4%, Lecigel 0.2%, Hydrolite 5 Green 3%, Phenoxyethanol, Ethylhexylglycerin.",
  },
];

export const PHASE1_PRODUCTS = PRODUCTS.filter(p => p.phase === 1);
export const ALL_PRODUCTS = PRODUCTS;
