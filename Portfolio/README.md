# Portfolio v1

Portfolio personnel developpe avec Vite, HTML, CSS et JavaScript.

## Stack

- HTML5
- CSS3
- JavaScript (ES Modules)
- Vite

## Lancer le projet en local

Prerequis:

- Node.js 18+
- npm

Installation:

```bash
npm install
```

Demarrer en mode developpement:

```bash
npm run dev
```

Construire pour la production:

```bash
npm run build
```

Previsualiser le build:

```bash
npm run preview
```

## Deploiement

Le projet peut etre deployee sur Netlify en connectant le repository GitHub.

Configuration recommandee:

- Build command: `npm run build`
- Publish directory: `dist`

## Fichiers sensibles et medias

Le fichier `.gitignore` exclut les fichiers sensibles et personnels:

- fichiers d'environnement (`.env*`)
- cles et certificats (`*.pem`, `*.key`, etc.)
- documents personnels et bureautiques
- medias (`images/`, `*.jpg`, `*.png`, etc.)

Important:

Si un fichier a deja ete versionne avant son ajout dans `.gitignore`, il reste suivi par Git.
Pour le retirer de l'index sans le supprimer localement:

```bash
git rm -r --cached images Documentation
```

Puis commit/push:

```bash
git commit -m "chore: stop tracking sensitive/media files"
git push
```
