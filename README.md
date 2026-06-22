# Tamapokone 🥚

Un compagnon de bureau **macOS** : une petite fenêtre flottante, toujours ouverte, dans laquelle vit une créature mignonne en **pixel-art pastel** dont on s'occupe au fil de la journée — on la nourrit, on joue avec, on la fait évoluer et monter de niveau.

## Principe central

**Un tamagotchi qui respecte ta vie.** Le temps de la créature n'avance **que quand l'app tourne** :

- App fermée / Mac éteint → l'état est gelé, rien ne se dégrade. La créature « dort » avec toi.
- Au réveil → elle est contente de te revoir. Pas de culpabilité, pas de mort par absence.
- **Aucune notification** quand l'app est fermée. Jamais la nuit.

## Concept

- **4 œufs** au choix (apparence purement cosmétique) → éclosion mystère après ~30 h de temps app-actif.
- **4 espèces** possibles : 🌸 Mochi, 🔥 Braisille, 💧 Axolo, 🌿 Sylphe.
- Stats douces à gérer : faim, gourmandise, sommeil, bonheur, propreté, santé, affinité.
- XP, niveaux, **évolution en 5 étapes** (œuf → bébé → enfant → ado → adulte), boutique, déco, mini-jeux.
- (v2/v3) Album photo, succès, réaction à l'activité du Mac, formes rares.

## Stack envisagée

Tauri + Svelte (fenêtre native légère, frameless, always-on-top, transparente).
Persistance via fichier local (JSON/SQLite) avec timestamp pour la pause hors-app.

## Documentation

📄 Spec produit complète : [`docs/Spécification Tamagotchi.md`](docs/Spécification%20Tamagotchi.md)
