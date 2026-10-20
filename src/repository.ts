import type { Wizard, Spell, NewWizard, SpellCategory, SpellFilter } from "./types";
import { Log, MeasureTime, ValidateSpellPower } from "./decorators";

// Repository generique et abstrait (on ne peut pas faire "new Repository()")
// T doit avoir un id
export abstract class Repository<T extends { id: number }> {
  private items: T[] = [];

  @Log
  add(item: T): void {
    this.items.push(item);
  }

  @MeasureTime
  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }

  getAll(): T[] {
    return [...this.items];
  }

  update(id: number, changes: Partial<T>): boolean {
    const item = this.findById(id);

    if (!item) return false;

    Object.assign(item, changes);
    return true;
  }

  // Nouveau : supprimer un element
  remove(id: number): boolean {
    const index = this.items.findIndex(item => item.id === id);

    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }
}

export class WizardRepository extends Repository<Wizard> {
  private nextId = 1;

  // Exercice 1 : l'appelant ne donne pas l'id, c'est le repository qui le donne
  register(data: NewWizard): Wizard {
    const wizard: Wizard = { id: this.nextId, ...data };
    this.nextId++;
    this.add(wizard);
    return wizard;
  }

  // Exercice 2 : Wizard["house"] = le type House (pas n'importe quel texte)
  findByHouse(house: Wizard["house"]): Wizard[] {
    return this.getAll().filter(wizard => wizard.house === house);
  }
}

export class SpellRepository extends Repository<Spell> {
  // Exercice 4 : refuse les sorts avec une puissance negative
  @ValidateSpellPower
  override add(spell: Spell): void {
    super.add(spell);
  }

  // Nouveau : sorts d'une categorie
  findByCategory(category: SpellCategory): Spell[] {
    return this.getAll().filter(spell => spell.category === category);
  }

  // Nouveau : sorts qui respectent un filtre (type SpellFilter)
  filter(predicate: SpellFilter): Spell[] {
    return this.getAll().filter(predicate);
  }
}
