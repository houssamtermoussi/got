# Game of Thrones

Site frontend fan (SvelteKit) — thème sombre, personnages, maisons, carte interactive de Westeros et Essos, bilingue FR/EN.

## Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- [npm](https://www.npmjs.com/) (fourni avec Node.js)
- [Git](https://git-scm.com/)

## Cloner le projet

```sh
git clone https://github.com/houssamtermoussi/got.git
cd got
```

## Installation et démarrage

```sh
npm install
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173).

## Stack

- SvelteKit + TypeScript + adapter-static
- GSAP (disponible) + parallax / révélations au scroll en CSS
- Données JSON locales (pas de backend)

## Build

```sh
npm run build
npm run preview
```

Le build génère un site statique dans `build/`.

En local, le site est servi sous le préfixe `/got` (comme sur GitHub Pages) : [http://localhost:5173/got/](http://localhost:5173/got/).

## Déploiement (GitHub Pages)

Le workflow `.github/workflows/deploy.yml` publie automatiquement le site à chaque push sur `main`.

URL : [https://houssamtermoussi.github.io/got/](https://houssamtermoussi.github.io/got/)

## Pages

| Route | Contenu |
|-------|---------|
| `/` | Accueil + hero parallax |
| `/personnages` | Liste des personnages |
| `/personnages/[id]` | Fiche personnage |
| `/maisons` | Liste des maisons |
| `/maisons/[id]` | Fiche maison + membres |
| `/carte` | Carte interactive Westeros / Essos |

## Langue

Sélecteur FR | EN dans la navigation (persisté dans `localStorage`).

## Note

Site non officiel, inspiré de l’univers de George R. R. Martin.

## Crédits images

Blasons et portraits issus de [Wikimedia Commons](https://commons.wikimedia.org) (licences Creative Commons BY / BY-SA). Voir les pages des fichiers sur Commons pour auteurs et licences détaillées.
