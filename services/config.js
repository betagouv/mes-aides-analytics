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
