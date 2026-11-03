# Game of Thrones

Site frontend fan (SvelteKit) — thème sombre, personnages, maisons, carte interactive de Westeros et Essos, bilingue FR/EN.

## Stack

- SvelteKit + TypeScript + adapter-static
- GSAP (disponible) + parallax / révélations au scroll en CSS
- Données JSON locales (pas de backend)

## Développement

```sh
npm install
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173).

## Build

```sh
npm run build
npm run preview
```

Le build génère un site statique dans `build/`.

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
