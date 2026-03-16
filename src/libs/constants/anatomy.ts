export const STRUCTURE_NAMES: Record<string, string> = {
  MX: "Maxilla",
  MDS: "Mandible",
  MLS: "Mandible",
  LV: "Lateral Ventricle",
  H: "Head",
  G: "Gut",
  C: "Chest cavity (Thorax)",
  AB: "Abdomen",
  B: "Buttocks",
  RBP: "Rhombencephalon",
  DP: "Diencephalon",
  NTAPS: "Nasal Tip and Pre-nasal Skin",
  NB: "Nasal Bone",
  NT: "Nuchal Translucency",
  CRL: "Crown-Rump Length",
};

export const getFullName = (abbrev: string): string =>
  STRUCTURE_NAMES[abbrev] || abbrev;
