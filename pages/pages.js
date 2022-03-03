import { Component } from "react"
import Fetch from "../services/fetch.js"
import DataFilter from "../services/dataFilter.js"

const periods = {
  day: { days: 1, label: "Dernière 24 heures" },
  week: { days: 7, label: "7 derniers jours" },
  month: { days: 30, label: "30 derniers jours" },
  year: { days: 365, label: "Une année" },
}

class PagesVisits extends Component {
  constructor(props) {
    super(props)
    this.state = {
      period: "month",
      pagesStats: [],
      sortBy: null,
      sortAscending: false,
    }
  }

  componentDidMount() {
    this.fetchPagesStats()
  }

  async fetchPagesStats() {
    this.setState(
      { sortBy: null, sortAscending: false, pagesStats: [] },
      async () => {
        const pagesStats = await Fetch.getJSON(
          `${process.env.pagesStatsURL}${periods[this.state.period].days}`
        )
        for (let element of pagesStats) {
          if (element.label == "simulation") {
            const result = []
            this.flatten(result, element.subtable)
            this.setState({ pagesStats: result })
          }
        }
        this.sortTable("exit_nb_visits")
      }
    )
  }

  flatten(output, array, depth = "") {
    const filter = /(resultat|debug|recapitulatif)/
    for (let element of array) {
      if (filter.test(element.label)) {
        continue
      }
      if (element.subtable) {
        this.flatten(output, element.subtable, `${depth}/${element.label}`)
      } else {
        output.push({
          label: `${depth}${element.label}`,
          nb_visits: element.nb_visits || 0,
          avg_page_load_time: element.avg_page_load_time,
          exit_nb_visits: element.exit_nb_visits || 0,
          exit_rate: element.exit_rate.replace(/\s+%/g, ""),
        })
      }
    }
  }

  sortTable(sortingBy) {
    const { output, sortAscending } = DataFilter.sort(
      this.state.pagesStats,
      sortingBy,
      this.state.sortBy,
      this.state.sortAscending,
      ["label"],
      ["nb_visits", "exit_nb_visits", "exit_rate"]
    )
    this.setState({
      sortAscending: sortAscending,
      sortBy: sortingBy,
      pagesStats: output,
    })
  }

  sortState(sortingBy) {
    if (sortingBy == this.state.sortBy) {
      return this.state.sortAscending ? "sortable-asc" : "sortable-desc"
    }
  }

  changePeriod(value) {
    this.setState({ period: value }, () => {
      this.fetchPagesStats()
    })
  }

  render() {
    return (
      <>
        <h2>Statistiques de visites</h2>
        <div className="flex-bottom flex-gap flex-justify">
          <label>
            <span>Période de référence</span>
            <br />
            <select
              onChange={(e) => this.changePeriod(e.target.value)}
              value={this.state.period}
            >
              {Object.keys(periods).map((k) => {
                return (
                  <option key={k} value={k}>
                    {periods[k].label}
                  </option>
                )
              })}
            </select>
          </label>
          <div>
            <span>{this.state.pagesStats.length} pages</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th onClick={() => this.sortTable("label")}>
                <div className={`sortable ${this.sortState("label")}`}>
                  Page
                </div>
              </th>
              <th onClick={() => this.sortTable("nb_visits")}>
                <div className={`sortable ${this.sortState("nb_visits")}`}>
                  Nombre de visite
                </div>
              </th>
              <th onClick={() => this.sortTable("exit_nb_visits")}>
                <div className={`sortable ${this.sortState("exit_nb_visits")}`}>
                  Nombre de sorties
                </div>
              </th>
              <th onClick={() => this.sortTable("exit_rate")}>
                <div className={`sortable ${this.sortState("exit_rate")}`}>
                  Taux de sortie
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {this.state.pagesStats.length > 0 &&
              this.state.pagesStats.map((page) => (
                <tr key={page.label}>
                  <td>{page.label}</td>
                  <td className="text-right">{page.nb_visits}</td>
                  <td className="text-right">{page.exit_nb_visits}</td>
                  <td className="text-right">
                    <div
                      className="gauge"
                      style={{
                        width: `${page.exit_rate}%`,
                        background: "#ff7f0e",
                      }}
                    ></div>
                    {page.exit_rate}%
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </>
    )
  }
}

export default PagesVisits
