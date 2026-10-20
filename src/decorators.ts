// Decorateur de methode : il recoit 3 arguments
// - _target : le prototype de la classe
// - propertyKey : le nom de la methode
// - descriptor : contient la methode dans descriptor.value

// Affiche les appels, les resultats et les erreurs d'une methode
export function Log(
  _target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    console.log(`[CALL] ${String(propertyKey)}`, args);

    try {
      const result = originalMethod.apply(this, args);
      console.log(`[RETURN] ${String(propertyKey)}`, result);
      return result;
    } catch (error: unknown) {
      console.error(`[ERROR] ${String(propertyKey)}`, error);
      throw error;
    }
  };
}

// Affiche le temps d'execution d'une methode
export function MeasureTime(
  _target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    const start = Date.now();

    try {
      return originalMethod.apply(this, args);
    } finally {
      console.log(`[TIME] ${String(propertyKey)}: ${Date.now() - start} ms`);
    }
  };
}

// Exercice 4 : refuse un sort dont la puissance est negative
export function ValidateSpellPower(
  _target: object,
  _propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    const candidate: unknown = args[0];

    // on verifie que c'est un objet qui contient "power" de type number
    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "power" in candidate &&
      typeof candidate.power === "number" &&
      candidate.power < 0
    ) {
      throw new Error("Spell power cannot be negative");
    }

    return originalMethod.apply(this, args);
  };
}

// Exercice 5 : garde en memoire les resultats deja calcules
export function Cache(
  _target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

  // un cache different pour chaque objet (instance)
  const instanceCaches = new WeakMap<object, Map<string, unknown>>();

  descriptor.value = function (this: object, ...args: unknown[]): unknown {
    let cache = instanceCaches.get(this);
    if (!cache) {
      cache = new Map<string, unknown>();
      instanceCaches.set(this, cache);
    }

    // la cle = les arguments transformes en texte
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log(`[CACHE HIT] ${String(propertyKey)}`);
      return cache.get(key);
    }

    console.log(`[CACHE MISS] ${String(propertyKey)}`);
    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
