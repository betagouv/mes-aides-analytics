import Fetch from "./fetch"

import configuration from "../next.config.js"

function formatFunnelData(data) {
  return {
    visitToRecap: [
      { label: "1ère Page", total: data.firstPageVisits },
      { label: "2ème Page", total: data.secondPageVisits },
      { label: "Page de Résultats", total: data.resultsPageVisits },
    ],
    surveyData: [
      {
        label: "Email de sondage envoyés",
        total: data.followupWithSurveyCount,
      },
      {
        label: "Sondages répondus",
        total: data.followupWithSurveyRepliedCount,
      },
    ],
    accompanimentData: [
      { label: "RDV affiché", total: data.showAccompanimentCount },
      { label: "RDV cliqué", total: data.clickAccompanimentCount },
    ],
  }
}

export const fetchFunnelData = async () => {
  const statsResponse = await Fetch.getJSON(
    configuration.env.aidesJeunesStatisticsURL,
  )

  const funnelData = statsResponse.funnel
  const chartsData = {}
  for (const [month, data] of Object.entries(funnelData)) {
    chartsData[month] = formatFunnelData(data)
  }

  return {
    availableMonths: Object.keys(funnelData),
    chartsData,
  }
}
