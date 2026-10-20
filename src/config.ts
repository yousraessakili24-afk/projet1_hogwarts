// Interface merging : on declare 2 fois la meme interface,
// TypeScript fusionne les deux en une seule
export interface AcademyConfig {
  name: string;
  maxLevel: number;
}

export interface AcademyConfig {
  headmaster: string;
}

// Interface qui etend une autre interface
export interface DebugConfig extends AcademyConfig {
  verbose: boolean;
}

const config: DebugConfig = {
  name: "Hogwarts Academy",
  maxLevel: 10,
  headmaster: "Albus Dumbledore",
  verbose: true
};

// export default : un seul element principal par fichier
export default config;
