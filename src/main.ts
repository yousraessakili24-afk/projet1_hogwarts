import type {
  Wizard,
  House,
  Spell,
  AcademyEvent,
  SpellCastEvent,
  SpellOutcome,
  SpellStats,
  EventCounter,
  RankingEntry,
  WizardSummary,
  WizardUpdate,
  WizardProfile,
  WizardSnapshot,
  TeachingWizard,
  HousePoints,
  SpellOutput,
  ArrayElement,
  AttackSpell,
  NonHealingCategory
} from "./types";
import { Role, Year } from "./types";
import { WizardRepository, SpellRepository } from "./repository";
import { Log, Cache } from "./decorators";
import config from "./config";

// ---------- Exercice 6 : type guards ----------

const validHouses: readonly House[] = [
  "Gryffindor",
  "Slytherin",
  "Ravenclaw",
  "Hufflepuff"
];

// "value is House" : si la fonction renvoie true, TypeScript sait que c'est une House
function isHouse(value: unknown): value is House {
  return (
    typeof value === "string" &&
    validHouses.some(house => house === value)
  );
}

function isRole(value: unknown): value is Role {
  return (
    value === Role.Student ||
    value === Role.Prefect ||
    value === Role.Professor
  );
}

function isWizard(value: unknown): value is Wizard {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    isHouse(candidate.house) &&
    isRole(candidate.role) &&
    typeof candidate.year === "number" &&
    candidate.year >= Year.First &&
    candidate.year <= Year.Seventh &&
    typeof candidate.level === "number" &&
    typeof candidate.active === "boolean"
  );
}

// ---------- Exercice 5 : cache ----------

class SpellCalculator {
  @Cache
  calculatePower(basePower: number, multiplier: number): number {
    console.log("Calculating...");
    return basePower * multiplier;
  }
}

// ---------- Exercice 3 : gestionnaire d'evenements ----------

function handleSpellCast(event: SpellCastEvent): void {
  console.log(`Wizard ${event.wizardId} cast ${event.spellName}`);
}

// ---------- Interface + classe qui l'implemente ----------

interface Reportable {
  report(): string;
}

// "implements" : la classe doit avoir toutes les methodes de l'interface
class HouseCup implements Reportable {
  constructor(private readonly points: HousePoints) {}

  report(): string {
    return validHouses
      .map(house => `${house}: ${this.points[house]} pts`)
      .join(" | ");
  }
}

// ---------- Le service de l'academie ----------

class AcademyService {
  // index signature : nombre de fois ou chaque sort a ete lance
  private spellStats: SpellStats = {};

  constructor(
    private readonly wizards: WizardRepository,
    private readonly spells: SpellRepository
  ) {}

  @Log
  castSpell(wizardId: number, spellId: number): string {
    const wizard = this.wizards.findById(wizardId);
    const spell = this.spells.findById(spellId);

    if (!wizard || !spell) {
      throw new Error("Wizard or spell not found");
    }

    this.spellStats[spell.name] = (this.spellStats[spell.name] ?? 0) + 1;
    return `${wizard.name} casts ${spell.name}!`;
  }

  // un sort avec une puissance >= 50 reussit
  checkOutcome(spell: Spell): SpellOutcome {
    return spell.power >= 50 ? "success" : "failure";
  }

  findByHouse(house: House): WizardSummary[] {
    return this.wizards
      .findByHouse(house)
      .map(({ id, name, house }) => ({ id, name, house }));
  }

  updateWizard(id: number, changes: WizardUpdate): boolean {
    return this.wizards.update(id, changes);
  }

  getSpellEvents(events: AcademyEvent[]): SpellCastEvent[] {
    return events.filter(
      (event): event is SpellCastEvent => event.type === "spell-cast"
    );
  }

  // compte combien d'evenements de chaque type
  countEvents(events: AcademyEvent[]): EventCounter {
    const counter: EventCounter = {
      "spell-cast": 0,
      "level-up": 0,
      "wizard-expelled": 0
    };

    for (const event of events) {
      counter[event.type]++;
    }

    return counter;
  }

  getSpellStats(): SpellStats {
    return this.spellStats;
  }

  // points de chaque maison (somme des niveaux des sorciers actifs)
  getHousePoints(): HousePoints {
    const points: HousePoints = {
      Gryffindor: 0,
      Slytherin: 0,
      Ravenclaw: 0,
      Hufflepuff: 0
    };

    for (const wizard of this.wizards.getAll()) {
      if (wizard.active) {
        points[wizard.house] += wizard.level;
      }
    }

    return points;
  }

  // classement des maisons : tableau de tuples [maison, points]
  getRanking(): RankingEntry[] {
    const points = this.getHousePoints();
    const ranking: RankingEntry[] = [];

    for (const house of validHouses) {
      ranking.push([house, points[house]]);
    }

    return ranking.sort((a, b) => b[1] - a[1]);
  }
}

// ---------- Donnees de depart ----------

const wizards = new WizardRepository();
const spells = new SpellRepository();

wizards.register({
  name: "Harry Potter",
  house: "Gryffindor",
  role: Role.Student,
  year: Year.Fifth,
  level: 5,
  active: true,
  patronus: "Stag"
});
wizards.register({
  name: "Hermione Granger",
  house: "Gryffindor",
  role: Role.Prefect,
  year: Year.Fifth,
  level: 8,
  active: true
});
wizards.register({
  name: "Draco Malfoy",
  house: "Slytherin",
  role: Role.Student,
  year: Year.Fifth,
  level: 6,
  active: true
});

spells.add({ id: 101, name: "Expelliarmus", category: "attack", power: 80 });
spells.add({ id: 102, name: "Protego", category: "defense", power: 60 });

const academy = new AcademyService(wizards, spells);

// ---------- Tests ----------

console.log(`Bienvenue a ${config.name} (directeur : ${config.headmaster})`);

console.log("\n--- Ex.1 : ajouter un sorcier ---");
const luna = wizards.register({
  name: "Luna Lovegood",
  house: "Ravenclaw",
  role: Role.Student,
  year: Year.Fourth,
  level: 7,
  active: true,
  patronus: "Hare"
});
console.log(luna);

console.log("\n--- Ex.2 : filtrer par maison ---");
console.log(academy.findByHouse("Gryffindor"));
// academy.findByHouse("Durmstrang"); // erreur de compilation : ce n'est pas une House

console.log("\n--- Ex.3 : evenement de sort ---");
handleSpellCast({ type: "spell-cast", wizardId: 1, spellName: "Expelliarmus" });

const events: AcademyEvent[] = [
  { type: "spell-cast", wizardId: 1, spellName: "Lumos" },
  { type: "level-up", wizardId: 2, newLevel: 9 },
  { type: "wizard-expelled", wizardId: 3 }
];
console.log(academy.getSpellEvents(events));
console.log(academy.countEvents(events));

console.log("\n--- Ex.4 : puissance d'un sort ---");
spells.add({ id: 103, name: "Lumos", category: "healing", power: 20 });
try {
  spells.add({ id: 104, name: "Invalid Spell", category: "attack", power: -10 });
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log("Erreur :", error.message);
  }
}
console.log(spells.findByCategory("healing"));
console.log(spells.filter(spell => spell.power >= 50));
console.log("Resultat de Lumos :", academy.checkOutcome({ id: 103, name: "Lumos", category: "healing", power: 20 }));

console.log("\n--- Lancer des sorts (Log + index signature) ---");
academy.castSpell(1, 101);
academy.castSpell(1, 101);
console.log(academy.getSpellStats());

console.log("\n--- Ex.5 : cache ---");
const calculator = new SpellCalculator();
console.log(calculator.calculatePower(10, 3));
console.log(calculator.calculatePower(10, 3));
console.log(calculator.calculatePower(5, 2));

console.log("\n--- Ex.6 : type guard ---");
const validData: unknown = {
  id: 1,
  name: "Harry Potter",
  house: "Gryffindor",
  role: Role.Student,
  year: Year.Fifth,
  level: 5,
  active: true
};
const invalidData: unknown = {
  id: 2,
  name: "Viktor",
  house: "Durmstrang",
  role: Role.Student,
  year: Year.Sixth,
  level: 5,
  active: true
};
console.log(isWizard(validData)); // true
console.log(isWizard(invalidData)); // false

console.log("\n--- Modifier et supprimer ---");
academy.updateWizard(1, { level: 6 });
console.log(wizards.findById(1));
console.log("Supprime ?", wizards.remove(3));

console.log("\n--- Classement des maisons (tuples) ---");
console.log(academy.getRanking());
console.log(new HouseCup(academy.getHousePoints()).report());

console.log("\n--- Notions du cours ---");
// Intersection : TeachingWizard = Wizard + subject
const snape: TeachingWizard = {
  id: 99,
  name: "Severus Snape",
  house: "Slytherin",
  role: Role.Professor,
  year: Year.Seventh,
  level: 10,
  active: true,
  subject: "Potions"
};
console.log(snape.name, "enseigne", snape.subject);

// Required et Readonly
const harry = wizards.getAll()[0];
if (harry) {
  const profile: WizardProfile = { ...harry, patronus: harry.patronus ?? "inconnu" };
  const snapshot: WizardSnapshot = { ...harry };
  // snapshot.level = 10; // erreur de compilation : lecture seule
  console.log(profile.patronus, snapshot.level);
}

// Enum numerique
console.log(`Annee : ${Year[Year.Fifth]} = ${Year.Fifth}`);

// Casting : as, <> et force casting (a eviter : un type guard est plus sur)
const raw: unknown = wizards.findById(2);
const withAs = raw as Wizard; // avec "as"
const withAngle = <Wizard>raw; // avec <>
const forced = "5" as unknown as number; // force casting : on passe par unknown
console.log(withAs.name, withAngle.house, typeof forced);

// ---------- Exemples de types (verifies par TypeScript) ----------

export type CastArguments = Parameters<AcademyService["castSpell"]>; // [number, number]
export type CastResult = ReturnType<AcademyService["castSpell"]>; // string
export type AttackOutput = SpellOutput<"attack">; // number
export type HealingOutput = SpellOutput<"healing">; // string
export type SpellItem = ArrayElement<Spell[]>; // Spell
export type AttackSpellExample = AttackSpell;
export type RemainingCategories = NonHealingCategory; // "attack" | "defense"
