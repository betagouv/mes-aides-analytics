import { Component } from "react"
import dynamic from "next/dynamic"

const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((m) => m.ResponsiveBar),
  { ssr: false },
)
import Fetch from "../services/fetch.js"
import Loader from "../components/Loader.js"
import VisitsHeatmap from "../components/visitsHeatmap.js"

const statsTypes = {
  visites: "Visites totales par mois",
  simulations: "Simulation terminée par mois",
}

class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visitData: [],
      regionVisits: [],
      kpi: {
        totalSimulations: 0,
        totalVisits: 0,
        previousMonthSimulations: 0,
        previousMonthVisits: 0,
        previousMonthLabel: "",
        nationalBenefits: 0,
        localBenefitsTotal: 0,
      },
      observatory: "",
      loading: true,
    }
  }

  async componentDidMount() {
    const today = new Date()
    const nextMonth = `${today.getFullYear()}-${(today.getMonth() + 2) % 12}-01`
    this.setState({ observatory: `${process.env.observatoryURL}${nextMonth}` })
    const { visitData, kpi, regionVisits } =
      await Fetch.getUsageDashboard(today)

    this.setState({
      visitData,
      kpi,
      regionVisits,
      loading: false,
    })
  }

  render() {
    if (this.state.loading) {
      return <Loader />
    }

    return (
      <>
        <h1 data-testid="title">
          Statistiques d'impact et d'aide à l'amélioration du produit Mes Aides
        </h1>
        <h2>Statistiques d'usage</h2>

        <div className="kpi-grid" data-testid="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card-number">
              {this.state.kpi.totalVisits.toLocaleString("fr-FR")}
            </div>
            <div className="kpi-card-label">visites depuis 2021</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card-number">
              {this.state.kpi.totalSimulations.toLocaleString("fr-FR")}
            </div>
            <div className="kpi-card-label">
              simulations terminées depuis 2021
            </div>
          </div>
          <div className="kpi-card kpi-card-local">
            <div className="kpi-card-number">
              {this.state.kpi.localBenefitsTotal.toLocaleString("fr-FR")}
            </div>
            <div className="kpi-card-label">
              aides locales disponibles sur le simulateur
            </div>
          </div>
          <div className="kpi-card kpi-card-local">
            <div className="kpi-card-number">
              {this.state.kpi.previousMonthVisits.toLocaleString("fr-FR")}
            </div>
            <div className="kpi-card-label">
              visites en {this.state.kpi.previousMonthLabel}
            </div>
          </div>
          <div className="kpi-card kpi-card-local">
            <div className="kpi-card-number">
              {this.state.kpi.previousMonthSimulations.toLocaleString("fr-FR")}
            </div>
            <div className="kpi-card-label">
              simulations terminées en {this.state.kpi.previousMonthLabel}
            </div>
          </div>
          <div className="kpi-card kpi-card-local">
            <div className="kpi-card-number">
              {this.state.kpi.nationalBenefits.toLocaleString("fr-FR")}
            </div>
            <div className="kpi-card-label">aides nationales disponibles</div>
          </div>
        </div>

        <div className="flex-justify">
          {Object.keys(statsTypes).map((key) => (
            <div key={key} className="flex-column">
              <h3>{statsTypes[key]}</h3>

              <div className="responsive-chart" data-testid={key}>
                <ResponsiveBar
                  data={this.state.visitData}
                  indexBy="month"
                  indexScale={{ type: "band", round: true }}
                  keys={[key]}
                  groupMode="grouped"
                  margin={{ top: 15, right: 10, bottom: 50, left: 60 }}
                  padding={0.3}
                  animate={false}
                  colors={["#a4c4eb"]}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legendOffset: 32,
                  }}
                  role="figure"
                />
              </div>
            </div>
          ))}
        </div>

        <VisitsHeatmap data={this.state.regionVisits} />

        <p>
          Les statistiques d'usage du simulateur sont publiques et accessibles à
          partir de{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://stats.data.gouv.fr/index.php?idSite=165&module=MultiSites&action=index&date=2024-07-29&period=month"
          >
            la page suivante
          </a>{" "}
          pour les données jusqu'à juillet 2024 (site web « aides-jeunes ») et{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://stats.beta.gouv.fr/index.php?module=MultiSites&action=index&idSite=63&period=month&date=yesterday"
          >
            la page suivante
          </a>{" "}
          pour les données à partir d'août 2024 (site web «
          mes-aides.1jeune1solution.beta.gouv.fr »), à côté des statistiques
          d'usage d'autres Startups d'État.
        </p>

        <h2>Observatoire de la qualité des démarches en ligne</h2>

        <p>
          La synthèse des avis déposés par les usagers grâce au bouton « Je
          donne mon avis » est publique et accessible sur l'observatoire de la
          qualité des démarches en ligne à{" "}
          <a target="_blank" rel="noreferrer" href={this.state.observatory}>
            la page suivante
          </a>
          .
        </p>
      </>
    )
  }
}

export default Index
