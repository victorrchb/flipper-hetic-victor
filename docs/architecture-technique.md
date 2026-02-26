# 4. Architecture Technique

## 4.1 Vue d'Ensemble

**4 composants interconnectés via WebSocket :**

- **PLAYFIELD** : Rendu 3D (Three.js) + physique (Cannon.js). Détecte collisions.
- **SERVEUR** : Logique centrale. Calcule score. Synchronise les 3 écrans.
- **BACKGLASS** : Affiche score, vies, high score.
- **DMD** : Messages arcade ("100 POINTS!", "GAME OVER").

**Communication** : WebSocket temps réel (< 50ms)

**Flux type** : Collision détectée par Cannon.js → Serveur calcule points → Broadcast aux 3 écrans → Affichage synchronisé

---

## 4.2 Stack Technique

- **Three.js** (3D) : Rendu WebGL performant, grande communauté, nombreux exemples
- **Cannon.js** (physique) : Simulation physique réaliste, collisions précises, intégration native avec Three.js
- **Node.js** (backend) : Event-driven adapté au temps réel, JavaScript front+back
- **Socket.io** (WebSocket) : Communication bidirectionnelle instantanée, gestion reconnexion, API simple
- **Vite** (build) : Dev server ultra-rapide, hot reload, build optimisé

**Choix clés :**
- Three.js : Standard 3D web
- Cannon.js : Léger (200 KB vs 1.5 MB pour Ammo.js)
- Socket.io : Reconnexion auto, broadcast natif

---

## 4.3 Schéma de Communication

```
SERVEUR (Node.js + Socket.io, Port 3000)
    |
    +- WebSocket connection
    |
    +-----> PLAYFIELD (Three.js + Cannon.js, Port 5173)
    |
    +-----> BACKGLASS (Canvas, Port 5174)
    |
    +-----> DMD (Canvas, Port 5175)
```

---

## 4.4 Flux de Données

```
Collision detectee (Cannon.js)
    --> Playfield envoie au Serveur
        --> Serveur calcule score
            --> Serveur broadcast a tous les clients
                --> Affichage synchronise sur 3 écrans
```
