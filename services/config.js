export const Config = {
  institutionsType: [
    { label: "Tout type géographique", value: "*" },
    { label: "Organisations nationales", value: "national" },
    { label: "Régions", value: "region" },
    { label: "Départements", value: "departement" },
    { label: "CAF locales", value: "caf" },
    { label: "EPCI (Métropole, inter-communauté, etc.)", value: "epci" },
    { label: "Communes", value: "commune" },
  ],
  surveyLabels: {
    asked: {
      legend:
        "Au moins une prestation de la simulation a fait l'objet d'une demande réussie (c'est à dire que l'usager a été au bout de la démarche)",
      short: "Demande réussie",
      single: "D. réussie",
      color: "#2ca02c",
      lightColor: "#d4ebd4",
    },
    failed: {
      legend:
        "Au moins une prestation de la simulation a fait l'objet d'une demande mais l'usager <b>N'A PAS</b> réussi à aller au bout de la démarche",
      short: "Demande échouée",
      single: "D. échouée",
      color: "#ff7f0e",
      lightColor: "#ffe5ce",
    },
    nothing: {
      legend:
        "Aucune prestation n'a fait l'objet d'une demande alors qu'elles ne sont pas perçues",
      short: "Aucune demande",
      single: "Rien fait",
      color: "#d62728",
      lightColor: "#f6d3d3",
    },
    already: {
      legend: "Toutes les prestations affichées étaient déjà perçues",
      short: "Déjà perçues",
      single: "Déjà perçue",
      color: "#7f7f7f",
      lightColor: "#e5e5e5",
    },
  },
  pageEventColors: {
    Visites: "#d4ebd4",
    Sorties: "#f6d3d3",
  },
}

export const EventCategories = {
  SHOW: "Affiché",
  SHOW_DETAILS: "Détails affichés",
  ACTIONABLE: "Actionné",
  INELIGIBLE_ACTIONABLE: "Actionné inélig.",
  MISUNDERSTOOD: "Incompris",
  EXPLAIN: "Expliqué",
}

export const PercentageAnnotation = {
  [EventCategories.SHOW_DETAILS]: {
    annotation: "(1)",
    description:
      "Pourcentage calculé à partir du nombre de fois où l'aide a été affiché.",
  },
  [EventCategories.ACTIONABLE]: {
    annotation: "(2)",
    description:
      "Pourcentage calculé à partir du nombre de fois où le détail de l'aide a été affiché.",
  },
}

export const EventTypeCategoryMapping = {
  show: { cat: EventCategories.SHOW, color: "#1f77b4" },
  showDetails: { cat: EventCategories.SHOW_DETAILS, color: "#ff7f0e" },
  form: {
    cat: EventCategories.ACTIONABLE,
    name: "Formulaire",
    color: "#2ca02c",
  },
  instructions: {
    cat: EventCategories.ACTIONABLE,
    name: "Instructions",
    color: "#d62728",
  },
  link: { cat: EventCategories.ACTIONABLE, name: "Lien", color: "#9467bd" },
  msa: { cat: EventCategories.ACTIONABLE, name: "MSA", color: "#8c564b" },
  "show-locations": {
    cat: EventCategories.ACTIONABLE,
    name: "Agence",
    color: "#e377c2",
  },
  teleservice: {
    cat: EventCategories.ACTIONABLE,
    name: "Téléservice",
    color: "#7f7f7f",
  },
  "link-ineligible": {
    cat: EventCategories.INELIGIBLE_ACTIONABLE,
    name: "Lien sans éligibilité",
    color: "#bcbd22",
  },
  "show-unexpected-amount-link": {
    cat: EventCategories.MISUNDERSTOOD,
    name: "Display Lien Incompris",
    color: "#17becf",
  },
  "show-unexpected": { cat: EventCategories.MISUNDERSTOOD, color: "#17becf" },
  close: { cat: EventCategories.EXPLAIN, name: "Fermé", color: "#1f77b4" },
  "retour-logement": {
    cat: EventCategories.EXPLAIN,
    name: "Retour page logement",
    color: "#ff7f0e",
  },
  "simulation-caf": {
    cat: EventCategories.EXPLAIN,
    name: "Simulateur CAF",
    color: "#2ca02c",
  },
  email: { cat: EventCategories.EXPLAIN, name: "Email", color: "#d62728" },
}
