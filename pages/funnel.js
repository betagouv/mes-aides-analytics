import { Component } from "react"

import { fetchFunnelData } from "../services/funnelService.js"
import { DefaultFunnelChart } from "../components/defaultFunnelChart.js"

class Funnel extends Component {
  state = {
    chartsData: null,
    loading: true,
    selectedMonth: null,
  }

  async componentDidMount() {
    await this.fetchData()
  }

  async fetchData() {
    const { availableMonths, chartsData } = await fetchFunnelData()

    const selectedMonth = availableMonths[0]

    this.setState({
      chartsData,
      selectedMonth,
      loading: false,
    })
  }

  render() {
    const { loading, selectedMonth, chartsData } = this.state

    if (loading) {
      return <p>Chargement...</p>
    }

    const { visitToRecap, surveyData, accompanimentData } =
      chartsData[selectedMonth]

    return (
      <>
        <h1 data-testid="title">Metriques de parcours {selectedMonth}</h1>

        <>
          <div className="funnel-charts">
            <div className="funnel-chart">
              <h2>Visites - Emails Récapitulatifs</h2>
              {visitToRecap && <DefaultFunnelChart data={visitToRecap} />}
            </div>

            <div className="funnel-chart">
              <h2>Sondages Envoyés - Répondus</h2>
              {surveyData && <DefaultFunnelChart data={surveyData} />}
            </div>

            <div className="funnel-chart">
              <h2>Accompagnement</h2>
              {accompanimentData && (
                <DefaultFunnelChart data={accompanimentData} />
              )}
            </div>
          </div>
        </>
      </>
    )
  }
}

export default Funnel
