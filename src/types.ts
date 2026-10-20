// Les 4 maisons possibles (type litteral + union)
export type House = "Gryffindor" | "Slytherin" | "Ravenclaw" | "Hufflepuff";

// Enum de type texte : le role d'un sorcier
export enum Role {
  Student = "STUDENT",
  Prefect = "PREFECT",
  Professor = "PROFESSOR"
}

// Enum numerique : l'annee d'etude (First = 1, Second = 2, ...)
export enum Year {
  First = 1,
  Second,
  Third,
  Fourth,
  Fifth,
  Sixth,
  Seventh
}

// Un sorcier
export interface Wizard {
  id: number;
  name: string;
  house: House;
  role: Role;
  year: Year;
  level: number;
  active: boolean;
  patronus?: string; // facultatif : tous les sorciers n'ont pas de patronus
}

// Intersection de types : un sorcier + une matiere enseignee
export type TeachingWizard = Wizard & { subject: string };

export type SpellCategory = "attack" | "defense" | "healing";

// Le resultat d'un sort : reussite ou echec
export type SpellOutcome = "success" | "failure";

// Un sort
export interface Spell {
  id: number;
  name: string;
  category: SpellCategory;
  power: number;
}

// Alias de type pour une fonction : un filtre sur les sorts
export type SpellFilter = (spell: Spell) => boolean;

// Un evenement de l'academie (union discriminee grace au champ "type")
export type AcademyEvent =
  | { type: "spell-cast"; wizardId: number; spellName: string }
  | { type: "level-up"; wizardId: number; newLevel: number }
  | { type: "wizard-expelled"; wizardId: number };

// Type mappe : un compteur pour chaque type d'evenement
export type EventCounter = {
  [K in AcademyEvent["type"]]: number;
};

// Index signature : on ne connait pas les noms des sorts a l'avance
export interface SpellStats {
  [spellName: string]: number;
}

// Conditional type : le resultat depend de la categorie du sort
export type SpellOutput<T extends SpellCategory> =
  T extends "attack" ? number :
  T extends "defense" ? boolean :
  T extends "healing" ? string :
  never;

// infer : recupere le type des elements d'un tableau
export type ArrayElement<T> = T extends (infer Item)[] ? Item : never;

// Utility types
export type NewWizard = Omit<Wizard, "id">;
export type WizardSummary = Pick<Wizard, "id" | "name" | "house">;
export type WizardUpdate = Partial<Wizard>;
export type WizardProfile = Required<Wizard>; // toutes les proprietes obligatoires
export type WizardSnapshot = Readonly<Wizard>; // plus rien ne peut etre modifie
export type AttackSpell = Extract<Spell, { category: "attack" }>;
export type NonHealingCategory = Exclude<SpellCategory, "healing">;
export type HousePoints = Record<House, number>;

// Tuple readonly : [maison, points]
export type RankingEntry = readonly [House, number];

// Exercice 3 : on garde seulement l'evenement "spell-cast"
export type SpellCastEvent = Extract<AcademyEvent, { type: "spell-cast" }>;
