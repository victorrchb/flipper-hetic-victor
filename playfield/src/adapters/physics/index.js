/**
 * Barrel — selection du moteur physique.
 *
 * Backend par defaut : Cannon-es (stable, MVP valide).
 *
 * Pour basculer sur Rapier :
 *   1. installer @dimforge/rapier3d-compat
 *   2. commenter la ligne `from "./cannon/index.js"`
 *   3. decommenter la ligne `from "./rapier/index.js"`
 *   4. main.js doit attendre `await initRapier()` avant la boucle (cf. rapier/index.js)
 *
 * Cf. ports/PhysicsPort.js pour le contrat d'API attendu de chaque backend.
 */

export * from "./cannon/index.js";
// export * from "./rapier/index.js";

export const PHYSICS_ENGINE = "cannon";
