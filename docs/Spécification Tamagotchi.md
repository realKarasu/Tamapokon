# Tamapokone — Spec produit (compagnon de bureau macOS)

## Le concept en une phrase
**Tamapokone** : une petite fenêtre toujours ouverte sur le Mac, dans laquelle vit une créature mignonne dont je m'occupe au fil de la journée — je la nourris, je joue avec, je la fais évoluer et monter de niveau.

---

## ⚠️ Principe central : un tamagotchi qui respecte ma vie

C'est **le point le plus important** de la spec, à ne surtout pas bâcler.

Le temps de la créature **n'avance que quand l'app tourne**. Concrètement :

- Quand je quitte l'app ou que j'éteins le Mac → l'état est sauvegardé tel quel, et **plus rien ne se dégrade**. La créature « dort » avec moi.
- Quand je rouvre → elle se réveille contente de me revoir. **Pas** de « tu m'as abandonné 9h, je suis mourant ».
- **Aucune notification** quand l'app est fermée. **Jamais** la nuit.
- Pas de mécanique de culpabilité ni de mort par négligence pendant une absence. Au pire elle est un peu grognon au réveil, et ça repart vite.

> Techniquement : à chaque sauvegarde on stocke un timestamp. Au lancement, le temps « offline » est **ignoré** (ou plafonné à quelques minutes max pour une petite anim de réveil). Les stats ne décrémentent que sur du temps app-active.

---

## Démarrage : choix de l'œuf & éclosion mystère

L'aventure commence par un **œuf**, pas par une créature visible.

### Le choix
- Au tout premier lancement, on présente **4 œufs**, chacun avec une **apparence pastel différente** (couleurs, motifs).
- J'en choisis **un seul**. Les 3 autres disparaissent.
- **L'apparence de l'œuf ne donne aucun indice** sur la créature : c'est purement cosmétique. La créature à l'intérieur est **aléatoire** quel que soit l'œuf choisi. (Si on ajoute plus tard d'autres types d'œufs, certains pourront éventuellement donner un indice — pas les œufs de base.)
- **Une seule créature à la fois** pour le moment (pas d'élevage multiple en v1).

### L'incubation (~30 h en temps app-actif)
- L'œuf **met du temps à éclore** et il faut **s'en occuper** : le garder au chaud, le câliner, le surveiller.
- **Le soin conditionne l'éclosion** : si je néglige l'œuf, **il n'éclot pas** ou **met plus de temps**. Bien s'en occuper fait avancer l'incubation normalement.
- Durée cible : **~30 heures de temps app-actif** (pas calendaire — voir ci-dessous).
- À l'éclosion : **reveal** de la créature (aléatoire). Gros moment.
- Pendant l'incubation : interactions réduites (réchauffer, câliner l'œuf), une **barre de progression d'éclosion**, et l'œuf qui **bouge / se fissure progressivement**.

> **Cohérence avec le principe pause** : les ~30 h comptent en **temps app-actif uniquement**, jamais quand le Mac est éteint. L'œuf ne décompte pas la nuit.

---

## Les 4 créatures (espèces possibles)

À l'éclosion, l'œuf révèle **une** de ces 4 espèces, tirée au hasard. Toutes sont mignonnes, un peu fantastiques, en pixel-art pastel. Chacune a son **caractère**, son **plat préféré** et sa **forme rare** (selon le style d'élevage).

> Note : on pourrait appeler les créatures des **« pokones »** (clin d'œil au nom Tamapokone) — à valider.

### 1. 🌸 Mochi — la boule de guimauve
- **Look** : boule toute ronde rose pastel, grosses joues, mini-pattes, un petit toupet.
- **Caractère** : doux, câlin, gourmand, dort beaucoup.
- **Plat préféré** : dango / petits mochis.
- **Forme rare** : esprit-nuage floconneux et flottant.

### 2. 🔥 Braisille — le renardeau-flamme
- **Look** : petit renard pêche/corail, grandes oreilles, **flamme pastel** au bout de la queue.
- **Caractère** : vif, joueur, curieux — celui qui **suit le curseur** avec le plus d'énergie.
- **Plat préféré** : baies épicées.
- **Forme rare** : renard à plusieurs queues, façon kitsune.

### 3. 💧 Axolo — l'axolotl-câlin
- **Look** : axolotl menthe/aqua, branchies en forme de petits cœurs, sourire permanent.
- **Caractère** : calme, curieux, **adore le bain** et l'eau.
- **Plat préféré** : gelée d'algue.
- **Forme rare** : petit dragon d'eau élégant.

### 4. 🌿 Sylphe — l'esprit-pousse
- **Look** : petit esprit lavande/vert tendre avec une **feuille sur la tête**, yeux timides.
- **Caractère** : timide et attachant, **change visiblement** à mesure qu'on en prend soin.
- **Plat préféré** : baies sucrées.
- **Forme rare** : esprit floral en pleine floraison.

---

## Direction artistique

- **Pixel-art** sur toute l'app (créature, œufs, objets, déco, UI).
- **Palette pastel** : tons doux (rose, lavande, menthe, bleu ciel, pêche, crème). Rien de criard, ambiance mignonne et reposante.
- Sprites lisibles en petit (résolution volontairement basse, gros pixels assumés).
- UI cohérente avec le pixel-art (police pixel, icônes pixel) tout en restant douce grâce aux pastels.

---

## La fenêtre

- Petite fenêtre flottante, **toujours au-dessus** des autres (option activable/désactivable).
- **Sans bordure**, déplaçable en cliquant-glissant n'importe où sur la créature.
- Taille compacte (~250–320 px), idéalement fond transparent pour que seul le perso + son décor soient visibles.
- Présence dans la **barre de menu macOS** : petite icône avec accès rapide (afficher/masquer, nourrir vite, quitter).
- Au survol / clic, un petit panneau d'interactions apparaît (boutons ou menu radial), puis disparaît pour ne pas encombrer.

---

## Les stats à gérer

> **Rappel central** : faim, sommeil et maladie n'évoluent **que lorsque le Mac est allumé et l'app active**. Rien ne se dégrade la nuit / PC éteint.

| Stat | Rôle | Baisse avec | Remonte avec |
|------|------|-------------|--------------|
| **Faim** 🍖 | Besoin vital. Si trop basse → grognon, perd du bonheur | Le temps actif | Repas |
| **Gourmandise** 🍰 | Envie de friandises. La combler **booste le bonheur**… mais à l'excès **fait grossir** | Le temps actif | Friandises |
| **Sommeil / Énergie** 😴 | Si trop bas → s'endort tout seul | Le temps actif, les jeux | Dormir / sieste |
| **Bonheur** ❤️ | Cœur de la progression et de l'XP (détail plus bas) | Solitude, faim, saleté | Jeux, nourriture préférée, caresses, déco |
| **Propreté** 🧼 | Visuel (un peu sale = anim rigolote) + impacte le bonheur | Le temps, manger | Laver |
| **Santé** ➕ | Dérivée des autres. Une **maladie (rare)** peut survenir si tout est au plus bas longtemps | Négligence prolongée **en app** | Soigner + s'en occuper |
| **Affinité** 🔗 | Lien long terme (détail plus bas), distinct de l'humeur | Négligence durable | Soin régulier & varié |

Rythme **doux** : on doit pouvoir l'ignorer 1–2h sans drame. Le but c'est le plaisir, pas la corvée.

### Maladie & mort
- **Maladie : rare.** N'arrive que si faim + propreté + sommeil restent au plus bas **longtemps, en temps app-actif**. Se soigne facilement (interaction « soigner »).
- **La mort existe… mais il faut vraiment délaisser la créature.** Elle ne peut survenir qu'après un **abandon prolongé** en app (besoins au plus bas + maladie ignorée très longtemps), avec **plusieurs avertissements clairs** avant. Impossible par accident, et **jamais** à cause d'une absence / PC éteint. C'est un garde-fou de réalisme, pas une menace du quotidien.

---

## Les interactions (le fun)

### De base
- **Nourrir** — repas (remplit la **faim**), friandises (comblent la **gourmandise** + boostent le bonheur), et **nourriture préférée** (bonus de bonheur). Voir la section Nourriture.
- **Jouer** — mini-jeux (voir plus bas) qui rapportent bonheur + XP + pièces.
- **Câliner / caresser** — clic sur la créature → réaction mignonne, petit boost de bonheur.
- **Laver** — petite anim de bain.
- **Dodo** — la mettre en sieste pour recharger l'énergie (anim « Zzz »).
- **Soigner** — quand elle est malade.

### Vivantes
- **La nommer** au premier lancement.
- **Lui parler** : champ texte → elle répond avec des petites bulles préécrites selon son humeur.
- Elle **réagit à l'heure** (étirement le matin, baille le soir — mais uniquement app ouverte).
- Elle **réagit à l'activité du Mac** (souris, inactivité, Spotify, Teams…) — voir la section dédiée.
- **Événements aléatoires** : trouve une pièce, attrape un papillon, fait un câlin spontané, petit caprice rigolo.

---

## 🍖 Nourriture — deux jauges

Deux jauges distinctes pilotent l'alimentation :

- **Faim** : le besoin vital. On la remplit avec des **repas**. Laisser la faim au plus bas fait chuter le bonheur.
- **Gourmandise** : l'envie de sucré/friandises. La combler **augmente le bonheur**, mais **trop de friandises fait grossir** la créature.

### Les aliments
- **Repas** : de base gratuits/simples ; des recettes plus chouettes s'achètent en **pièces** ou se débloquent en niveau.
- **Friandises** : plaisir + bonheur, à doser.
- **Nourriture préférée** : chaque créature a **un plat fav** (lié à son espèce, découvert en jouant) qui donne un **gros bonus de bonheur**.

### Grossir (mécanique douce et fun)
- Trop de friandises sans dépense → la créature **grossit** (sprite plus rond, c'est mignon et rigolo).
- Effet léger : un peu moins d'énergie / plus pataude.
- Pour remincir : **jouer / bouger** et lever le pied sur les friandises. Aucune notion punitive — c'est un petit équilibre fun à gérer.

---

## ❤️ Bonheur

L'humeur du moment, moteur de l'XP et des animations idle.

**Monte avec :** les jeux · la **nourriture préférée** · les caresses · une **jolie déco** (pièce/fond agréable).
**Baisse avec :** la **solitude** (aucune interaction depuis longtemps, en app) · la **faim** · la **saleté**.

Le bonheur pilote l'anim idle (contente, neutre, grognon) et conditionne le gain d'XP : une créature heureuse progresse mieux.

---

## 🔗 Affinité (le lien)

Une jauge **séparée du bonheur** : le bonheur est l'humeur instantanée, l'**affinité est la relation sur la durée**.

- **Monte** quand je m'occupe bien et **régulièrement** de la créature (besoins satisfaits, interactions **variées**, présence dans le temps).
- **Baisse** lentement en cas de négligence durable — jamais quand le Mac est éteint.
- **Ce que ça débloque** : à haute affinité, la créature devient plus **affectueuse** (vient vers le curseur, réactions/animations spéciales, petits cœurs), et l'affinité peut **influencer la forme rare** et le **revenu passif** adulte.
- Les **paliers d'affinité** donnent des **pièces** et des **succès** → une vraie récompense au fait de bien s'en occuper sur le long terme.

---

## Progression & niveaux

- Chaque interaction rapporte de l'**XP**.
- Monter de **niveau** débloque :
  - de nouveaux **aliments**
  - de nouveaux **jouets / mini-jeux**
  - des **accessoires & tenues**
  - de la **déco** pour sa petite pièce
  - de nouvelles **réactions / animations**
- **Succès / trophées** : « 7 jours d'affilée », « 100 câlins », « premier niveau 10 », etc.
- Barre d'XP discrète + petite anim de **level up** satisfaisante (confettis, son léger).

### Ce que ça apporte concrètement (la motivation)
Pour que monter de niveau **donne vraiment envie**, deux échelles de récompense :

- **Chaque niveau** (petit palier) → un truc immédiat et tangible : pièces, déblocage d'un aliment / jouet / déco, parfois une nouvelle anim. Jamais un level up « vide ».
- **Chaque évolution** (gros palier) → un **vrai moment** : transformation visuelle marquante (anim + son), + de **nouvelles capacités**, + du **nouveau contenu** d'un coup. C'est la carotte principale.

L'idée forte : plus la créature grandit, **plus elle devient un vrai compagnon** — elle fait des choses seule, réagit davantage, et finit par gagner des pièces toute seule pendant que l'app tourne. On level up pour la voir devenir plus vivante, pas juste plus jolie.

### Évolution en 5 étapes
Chaque forme débloque des capacités, pas seulement un nouveau look :

| Étape | Palier | Nouveau look | Ce que ça débloque |
|-------|--------|--------------|--------------------|
| 1. **Œuf** | début | Œuf pastel qui bouge & se fissure | Incubation ~30 h (temps actif) ; **le soin conditionne l'éclosion**. **Reveal de la créature** à l'éclosion, puis on la nomme. |
| 2. **Bébé** | niv. 2–4 | Tout petit, fragile, dort beaucoup | Nourrir + câliner. Très dépendant, très mignon. |
| 3. **Enfant** | niv. 5–9 | Plus mobile, expressif | 1er **mini-jeu**, commence à **jouer seul**, premières tenues. |
| 4. **Ado** | niv. 10–17 | Caractère qui s'affirme | **Personnalité** (réponses, petits caprices fun), mini-jeux avancés, gagne **plus de pièces**, accessoires. |
| 5. **Adulte** | niv. 18+ | Forme finale stable | **Autonomie max** : activités solo, **revenu passif de pièces** quand l'app tourne, déco complète, anims exclusives. |

### Forme rare / légendaire (bonus, v3)
> L'œuf révèle **l'espèce** (Mochi, Braisille, Axolo ou Sylphe) ; le **style d'élevage** influence ensuite la **forme adulte / rare** de cette espèce (voir les formes rares listées par créature).

À haut niveau **et** selon le style d'élevage, l'adulte peut prendre une **forme rare** unique (look + anims exclusives) :
- Beaucoup de **jeu** → forme joueuse / sportive
- Beaucoup de **repas & friandises** → forme rondouillarde gourmande
- Beaucoup de **câlins** → forme câline / affective
- Élevage équilibré → forme « parfaite »

Ça donne un objectif long terme et une vraie **raison de s'investir dans un type d'activité** plutôt qu'un autre.

---

## Économie & boutique

### Gagner des pièces
- **Mini-jeux** : récompense principale, dosée selon le score.
- **XP / niveaux** : un petit bonus de pièces à chaque level up.
- **Défis quotidiens & hebdo** (la source « à mériter ») : objectifs qui demandent de **vraiment bien s'en occuper**, pas du clic facile. Ex. : « garder le bonheur > 80 % toute la journée », « 3 jeux différents aujourd'hui », « ne jamais laisser la faim au rouge cette semaine », « prendre une photo ». Les défis hebdo rapportent gros mais exigent de la régularité.
- **Paliers d'affinité & succès** : récompenses ponctuelles en pièces.
- **Revenu passif** (adulte uniquement, v3) : petite rente pendant que l'app tourne.
- **Trouvailles aléatoires** : la créature ramasse parfois une piécette (petit montant, pour le fun).

> Équilibrage : les pièces doivent rester **un peu rares**. Les beaux fonds, recettes et tenues sont des objectifs, pas des achats immédiats.

### Dépenser
- **Boutique** : nourriture (repas/friandises), jouets, tenues & accessoires, **arrière-plans/décors**.
- Objets « premium » qui demandent un peu de grind pour donner un cap.

---

## 🖼️ Arrière-plans & décors

- **Chambre classique** : fond par défaut, **gratuit**.
- **Autres fonds** achetables en pièces : ex. plage, forêt, espace, café cozy, nuit étoilée… (tous en pixel-art pastel).
- Le décor **influe sur le bonheur** : une pièce jolie/aménagée rend la créature plus heureuse (c'est l'une des sources de bonheur citées).
- Déco d'ambiance par-dessus le fond (plantes, guirlandes, posters…).

---

## 🏆 Collection de succès

Un écran **collection** qui liste les succès débloqués et à débloquer (avec icônes pixel).
- Exemples : première éclosion · atteindre le niveau 10 · 100 caresses · découvrir le plat préféré · remplir l'album (10/50 photos) · débloquer 3 fonds · affinité max · 7 jours d'affilée · obtenir une forme rare.
- Beaucoup de succès donnent une **récompense en pièces** one-shot.
- Sert d'objectifs annexes et de « livre d'or » de la relation.

---

## 📸 Album photo

- Bouton **photo** : capture la scène actuelle (créature + humeur + tenue + fond du moment) → enregistrée dans un **album** consultable, horodatée.
- **Captures auto** des grands moments (éclosion, évolution, level up) proposées à l'enregistrement.
- Album = source de **succès** (« remplis ton album ») et possibilité d'**exporter** une photo en image (nice-to-have, pour la partager).
- Colle parfaitement à l'esprit pixel-art : chaque cliché est une petite carte mignonne.

---

## 🖱️ Réaction à l'activité du Mac

La créature **vit avec mon usage de l'ordi** — détection **large**, tout en **local**. Idée : elle réagit à l'app active au premier plan, au « now playing », et à l'activité clavier/souris.

### États système
- **Souris qui bouge beaucoup** → elle s'excite, **suit le curseur**, regarde partout.
- **Activité intense (rush clavier/souris)** → elle s'agite / encourage, ou se met de côté pour ne pas gêner.
- **Inactivité** (aucune entrée depuis un moment) → elle s'occupe seule : sieste, joue, fait des bêtises.
- **Plein écran / mode focus** → elle se fait **discrète** automatiquement.

### Détection d'apps (au premier plan)
- **🎵 Spotify / Apple Music** → elle **danse en rythme**, note de musique au-dessus de la tête.
- **🎮 Discord** → en **vocal/appel** : mode discret (casque, « chut ») ; sinon petit coucou, bulle de message.
- **📹 Teams / Zoom / Google Meet** (visio) → **mode ne-pas-déranger** : se calme, se range dans un coin, casque, silencieuse.
- **🌐 Navigateur** (Safari, Chrome, Firefox, Arc) → curieuse, **lit par-dessus l'épaule**, suit le scroll des yeux.
- **💻 Éditeur de code / Terminal** (VS Code, JetBrains…) → met de **petites lunettes**, fait semblant de coder, air concentré.
- **🎨 Apps créatives** (Figma, Photoshop, Illustrator) → prend un mini-pinceau, admire.
- **🕹️ Jeu vidéo** (Steam, etc.) → s'excite, sort une manette miniature.
- **✉️ Mail / Slack** → apporte une petite enveloppe quand ça s'active.

> Note technique : détection de l'app active / du « now playing » / de l'activité entrée, **en local**, sans rien envoyer dehors. Chaque réaction est **désactivable** dans les réglages, avec un fallback neutre si une app n'est pas reconnue. Fonctionnalité v2/v3, à enrichir progressivement.

## Mini-jeux (idées)
- **Attrape** : cliquer sur des objets qui tombent.
- **Cache-cache** : deviner derrière quel meuble elle se cache.
- **Memory** de petites cartes.
- **Pierre-feuille-ciseaux** contre la créature.

Garder chaque jeu **court** (30 s – 1 min), c'est un compagnon de bureau, pas un jeu à plein temps.

## Personnalisation
- Tenues & accessoires (chapeaux, lunettes...).
- Déco de la pièce + fonds.
- Couleurs / variantes de la créature.

---

## Animations (pixel-art)

Le côté vivant passe par l'animation. Trois familles à prévoir :

### 1. Mini-animations d'interaction
Une petite anim dédiée à **chaque action** :
- **Manger** : mastication + petites miettes / cœur.
- **Câliner** : se blottit, cœurs qui montent.
- **Jouer** : saute / court après l'objet.
- **Laver** : bulles de savon, s'ébroue.
- **Dodo** : se roule en boule, « Zzz ».
- **Soigner** : prend le médoc, petite grimace puis sourire.
- **Level up / évolution** : flash + confettis pixel.

### 2. Animations d'humeur (état idle)
Quand je ne fais rien, l'anim de repos **change selon l'humeur** :
- **Contente** : petits sauts, regarde autour, sourit.
- **Neutre** : respire, cligne des yeux.
- **Grognon / faim** : boude, tape du pied, petite bulle.
- **Fatiguée** : baille, paupières lourdes.
- **Malade** : pâle, gouttes de sueur, bouge peu.
- **Joueuse (selon perso)** : fait des bêtises, court dans la fenêtre.

### 3. Animations de changement d'état
Les **transitions** sont mises en scène, pas instantanées :
- **Éclosion de l'œuf** : fissures qui s'élargissent → éclosion → reveal de la créature (gros moment).
- **Évolution** : silhouette qui brille / se transforme → nouvelle forme.
- **S'endort / se réveille** : transition douce (et au lancement, l'anim « réveil » après une session fermée).
- **Tombe malade / guérit** : changement progressif de l'apparence.
- **Change d'humeur** : petite transition entre deux états idle plutôt qu'un switch sec.

> Format conseillé : sprite sheets pixel-art (quelques frames par anim suffisent — le charme du pixel vient du peu de frames). Commencer par les anims du MVP (idle + manger + jouer + dodo + éclosion + level up), enrichir ensuite.

---

## Notes techniques (pour le dev)

- **Plateforme** : macOS. Fenêtre frameless, always-on-top, transparente, draggable, + item barre de menu.
- **Stack suggérée** (au choix) : **Tauri + Svelte** (léger, fenêtre native facile, et c'est ta stack), ou Electron si tu veux aller vite, ou Swift natif pour le plus propre.
- **Persistance** : un simple fichier local (JSON ou SQLite) avec l'état + timestamp.
- **Boucle de jeu** : un tick (genre toutes les quelques secondes/minutes) qui ne décrémente les stats **que lorsque l'app est active**. Au lancement, on lit le timestamp et on **n'applique pas** le temps écoulé hors-app. **L'incubation de l'œuf suit la même règle** (progresse en temps actif uniquement).
- **Rendu pixel-art** : afficher les sprites en `image-rendering: pixelated` (pas de lissage), assets en sprite sheets, palette pastel partagée.
- **Assets** : sprites du perso (par état : content, endormi, malade, mange...) + les 4 œufs + objets/déco. On peut commencer avec un perso simple et enrichir après.

---

## Priorisation

### MVP (v1 — l'essentiel jouable)
1. **Choix parmi 4 œufs** + **incubation ~30 h** (temps actif, soin requis) + **éclosion-reveal** (1 des 4 créatures)
2. Fenêtre flottante always-on-top + déplaçable
3. Rendu **pixel-art pastel** + anims de base (idle selon humeur, manger, jouer, dodo, éclosion, level up)
4. Stats de base : **faim, gourmandise, sommeil, bonheur** (+ propreté simple)
5. Nourrir (repas/friandises) + jouer (1 mini-jeu) + câliner + dormir + laver
6. XP + niveaux + **1 évolution** + gains de pièces + **boutique** minimale
7. **Sauvegarde avec pause hors-app** (le principe central)
8. La nommer (à l'éclosion)

### v2 (le fun en plus)
- **Affinité**, santé, **maladie rare**, soigner
- **Gourmandise → grossir** + nourriture préférée
- **Défis quotidiens/hebdo** (source de pièces à mériter)
- **Arrière-plans** payants + déco (impact bonheur)
- **Album photo** + bouton photo
- **Collection de succès**
- Plusieurs mini-jeux · événements aléatoires · item barre de menu
- Plus d'animations d'interaction & de transition d'état

### v3 (bonus)
- **Réaction à l'activité du Mac** (souris, inactivité, Spotify, Teams…)
- Formes rares selon le style d'élevage
- Revenu passif de pièces (adulte)
- **Mort** (garde-fou, négligence extrême uniquement) + avertissements
- Réactions à l'heure · lui parler (bulles) · export de photos

---

## Décisions prises
- **Nom** : Tamapokone.
- **Œuf** : 4 œufs au choix, apparence purement cosmétique, **aucun indice** sur la créature ; créature **aléatoire**.
- **Incubation** : **~30 h en temps app-actif** ; le **soin conditionne l'éclosion** (négligé = n'éclot pas / plus lent).
- **Créatures** : 4 espèces (Mochi, Braisille, Axolo, Sylphe), une seule à la fois pour l'instant.
- **Détection d'apps** : **large** (Spotify, Discord, Teams/Zoom, navigateur, code, créatif, jeu, mail/Slack), en local, désactivable.
- **Mort** : possible mais seulement en cas de **vrai délaissement** prolongé en app, avec avertissements ; jamais par absence.

## Questions ouvertes (à trancher plus tard)
- On appelle officiellement les créatures des **« pokones »** ?
- Ajouter d'autres **types d'œufs** plus tard (certains donnant un indice) ?
- Permettre **plusieurs créatures** dans une version future ?
- Valider la **durée exacte** d'incubation (~30 h) après test.
