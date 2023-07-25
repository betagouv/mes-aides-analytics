import Fetch from "./fetch"

import configuration from "../next.config.js"

function formatFunnelData(data) {
  return {
    visitToRecap: [
      { label: "Visites", total: data.visits },
      { label: "Visites Uniques", total: data.nbUniqVisitors },
      { label: "Simulations terminées", total: data.simulationCount },
      {
        label: "Emails de recap envoyés",
        "Avec recontact": data.followupWithOptinCount,
        "Sans recontact": data.followupWithoutOptinCount,
      },
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
