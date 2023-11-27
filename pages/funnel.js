import React, { useState, useEffect } from "react"

import { fetchFunnelData } from "../services/funnelService.js"
import { DefaultFunnelChart } from "../components/defaultFunnelChart.js"

function Funnel() {
  const [chartsData, setChartsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { availableMonths, chartsData } = await fetchFunnelData()
      const selectedMonth = availableMonths[0]
      setChartsData(chartsData)
      setSelectedMonth(selectedMonth)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <p>Chargement...</p>
  }

  const { visitToResults, surveyData, accompanimentData, followupData } =
    chartsData[selectedMonth]

  return (
    <>
      <h1 data-testid="title">Metriques de parcours {selectedMonth}</h1>
      <div className="funnel-charts">
        <div className="funnel-chart">
          <h2>Visites - Page Résultats</h2>
          {visitToResults && (
            <DefaultFunnelChart
              data={visitToResults}
              dataTestid="funnel-visits"
            />
          )}
        </div>

        <div className="funnel-chart">
          <h2>Nombre d'emails et/ou sms récapitulatifs</h2>
          {followupData && (
            <DefaultFunnelChart
              data={followupData}
              dataTestid="funnel-email"
              showLegend
            />
          )}
        </div>

        <div className="funnel-chart">
          <h2>Sondages Envoyés - Répondus</h2>
          {surveyData && <DefaultFunnelChart data={surveyData} />}
        </div>

        <div className="funnel-chart">
          <h2>Accompagnement</h2>
          {accompanimentData && <DefaultFunnelChart data={accompanimentData} />}
        </div>
      </div>
    </>
  )
}

export default Funnel
