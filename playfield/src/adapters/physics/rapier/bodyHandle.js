/**
 * Rapier — wrapper "cannon-like" autour des RigidBody Rapier.
 *
 * Objectif : exposer une API compatible avec ce que main.js + ballBody.js
 * + collisionListener.js etc. attendent d'un body Cannon-es :
 *
 *   body.position    : { x, y, z, set(x,y,z) }   (lect+ecrit)
 *   body.velocity    : { x, y, z, set(x,y,z) }   (lect+ecrit)
 *   body.quaternion  : { x, y, z, w, set(x,y,z,w) }
 *   body.angularVelocity  : { x, y, z, set(x,y,z) }
 *   body.userData    : { type, ... }
 *   body.applyImpulse(vec3)
 *   body.wakeUp()
 *
 * On utilise des Proxy pour que `body.position.y = 5` declenche bien
 * un `setTranslation` sur le rigid body Rapier sous-jacent.
 */

function makeVec3Proxy(getter, setter) {
  const target = {
    set(x, y, z) { setter({ x, y, z }); },
    copy(v) { setter({ x: v.x, y: v.y, z: v.z }); },
  };
  return new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop];
      const v = getter();
      return v[prop];
    },
    set(t, prop, value) {
      if (prop === "x" || prop === "y" || prop === "z") {
        const v = getter();
        v[prop] = value;
        setter(v);
        return true;
      }
      t[prop] = value;
      return true;
    },
  });
}

function makeQuatProxy(getter, setter) {
  const target = {
    set(x, y, z, w) { setter({ x, y, z, w }); },
    copy(q) { setter({ x: q.x, y: q.y, z: q.z, w: q.w }); },
  };
  return new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop];
      const q = getter();
      return q[prop];
    },
    set(t, prop, value) {
      if (prop === "x" || prop === "y" || prop === "z" || prop === "w") {
        const q = getter();
        q[prop] = value;
        setter(q);
        return true;
      }
      t[prop] = value;
      return true;
    },
  });
}

/**
 * Cree un BodyHandle "cannon-like" autour d'un RigidBody Rapier.
 *
 * `userData` contient au minimum `{ type }` (utilise par les collisions).
 * `colliders` est facultatif (utile si on veut reset un Collider plus tard).
 */
export function createBodyHandle(rb, world, { userData = {}, colliders = [] } = {}) {
  const handle = {
    rb,
    world,
    colliders,
    userData,
  };

  handle.position = makeVec3Proxy(
    () => rb.translation(),
    (v) => rb.setTranslation({ x: v.x, y: v.y, z: v.z }, true),
  );
  handle.velocity = makeVec3Proxy(
    () => rb.linvel(),
    (v) => rb.setLinvel({ x: v.x, y: v.y, z: v.z }, true),
  );
  handle.angularVelocity = makeVec3Proxy(
    () => rb.angvel(),
    (v) => rb.setAngvel({ x: v.x, y: v.y, z: v.z }, true),
  );
  handle.force = makeVec3Proxy(
    () => ({ x: 0, y: 0, z: 0 }),
    () => { /* Rapier accumule via addForce, set explicite non supporte tel quel */ },
  );
  handle.torque = makeVec3Proxy(
    () => ({ x: 0, y: 0, z: 0 }),
    () => { /* idem */ },
  );
  handle.quaternion = makeQuatProxy(
    () => rb.rotation(),
    (q) => rb.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, true),
  );

  handle.applyImpulse = (vec3) => {
    rb.applyImpulse({ x: vec3.x, y: vec3.y, z: vec3.z }, true);
  };
  handle.wakeUp = () => rb.wakeUp();
  handle.updateMassProperties = () => { /* Rapier le fait automatiquement */ };
  handle.addEventListener = () => {
    // Rapier n'expose pas de listeners par-body. Voir collisionListener.js
    // qui utilise un EventQueue centralise.
  };

  // Index dans la table des handles (cle = rb.handle, integer Rapier)
  bodyHandlesByRapierHandle.set(rb.handle, handle);

  return handle;
}

/**
 * Map globale des handles indexes par leur identifiant Rapier (entier).
 * Permet a `collisionListener.js` de remonter au userData depuis un handle.
 */
export const bodyHandlesByRapierHandle = new Map();
