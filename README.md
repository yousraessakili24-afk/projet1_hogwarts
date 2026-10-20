# Projet 1 - Hogwarts Academy

Ceci est mon projet TypeScript sur le theme de Hogwarts.
Il gere les sorciers, les sorts et les maisons de l'ecole.

## Comment lancer le projet

1. Installer les dependances :

```bash
npm install
```

2. Lancer le projet :

```bash
npm start
```

3. Verifier les types (pas d'erreur si rien ne s'affiche) :

```bash
npm run typecheck
```

## Les fichiers

- `src/types.ts` : tous les types (Wizard, Spell, evenements, utility types)
- `src/decorators.ts` : les decorateurs Log, MeasureTime, ValidateSpellPower et Cache
- `src/repository.ts` : le repository generique, WizardRepository et SpellRepository
- `src/config.ts` : la configuration de l'academie
- `src/main.ts` : les type guards, le service et les tests des 6 exercices

## Ce que j'ai fait

1. Ajouter un sorcier avec `register` (l'id est donne automatiquement)
2. Filtrer les sorciers par maison avec `findByHouse`
3. Gerer les evenements de sort avec `Extract`
4. Refuser un sort avec une puissance negative (decorateur `ValidateSpellPower`)
5. Garder les resultats en memoire (decorateur `Cache`)
6. Verifier la maison avec un type guard (`isHouse`, `isWizard`)

## Ce que j'ai change par rapport au projet du prof

- Ajout de l'annee (`year`) et du role (`role`) des sorciers avec des enums
- Ajout de `remove`, `findByCategory`, `filter` dans les repositories
- Ajout du classement des maisons et de la classe `HouseCup`
- Ajout d'un fichier de configuration `config.ts`
