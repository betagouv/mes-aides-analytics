import { Component } from "react"
import dynamic from "next/dynamic"

const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((m) => m.ResponsiveBar),
  { ssr: false },
)
import Fetch from "../services/fetch.js"

const statsTypes = {
  visites: "Visites",
  simulations: "Simulations terminées",
}

class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visitData: [],
      observatory: "",
    }
  }

  async componentDidMount() {
    const today = new Date()
    const nextMonth = `${today.getFullYear()}-${(today.getMonth() + 2) % 12}-01`
    this.setState({ observatory: `${process.env.observatoryURL}${nextMonth}` })
    this.setState({ visitData: await this.fetchData() })
  }

  async fetchData() {
    const globalOldStats = await Fetch.getJSON(
      process.env.usageStatisticsOldURL,
    )
    const globalNewStats = await Fetch.getJSON(process.env.usageStatisticsURL)
    const globalStats = { ...globalOldStats, ...globalNewStats }
    return Object.keys(globalStats).map((m) => {
      return {
        month: m,
        visites: globalStats[m].nb_visits || null,
        simulations: globalStats[m].nb_visits_converted || null,
      }
    })
  }

  render() {
    return (
      <>
        <h1 data-testid="title">
          Statistiques d'impact et d'aide à l'amélioration du produit Mes Aides
        </h1>
        <h2>Statistiques d'usage</h2>

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
