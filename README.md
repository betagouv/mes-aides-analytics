# Statistiques du site Aides-Jeunes

Dépôts d'expérimentations autour des données de Aides-Jeunes et du moteur de calculs OpenFisca-France

## Données et sources

Le projet consomme plusieurs sources de données distinctes selon le type de statistiques affichées.

- Matomo pour les statistiques d'usage mensuelles: visites et visites avec simulation terminée.
- `https://mes-aides.1jeune1solution.beta.gouv.fr/documents/stats.json` pour les agrégats métier: sondages, funnel et institutions.
- `https://mes-aides.1jeune1solution.beta.gouv.fr/api/benefits` pour le catalogue d'aides et les compteurs d'aides nationales et locales.
- `aides-jeunes-stats-recorder` pour les statistiques spécifiques à chaque aide (alternative à la limitation de Matomo de 500 lignes de données pour récupérer les informations des aides, nombre supérieur à 1000).

## Développement

Installation des dépendances:

```bash
npm ci
```

Lancer l'application en local:

```bash
npm run dev
```

Commandes utiles:

- `npm run build` pour générer le build de production.
- `npm run lint` pour lancer ESLint.
- `npm run prettier:check` pour vérifier le formatage.
- `npm run format` pour appliquer Prettier et ESLint automatiquement.
- `npm run cypress:open` pour lancer Cypress en mode interactif.
- `npm run test:e2e` pour exécuter les tests E2E.

## Déploiement et intégration continue

L'intégration continue est définie dans [ci.yml](.github/workflows/ci.yml).

Le déploiement continu est défini dans [cd.yml](.github/workflows/cd.yml).

Sur chaque push sur la branche `main`, le site est buildé puis [déployé en production](https://betagouv.github.io/mes-aides-analytics/).
