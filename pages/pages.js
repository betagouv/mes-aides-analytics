import { Component } from "react"

import ViewSwitch from "../components/viewSwitch.js"

import { Config } from "../services/config.js"
import Fetch from "../services/fetch.js"
import DataFilter from "../services/dataFilter.js"
import DateRange from "../services/date.js"
import dynamic from "next/dynamic"

const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((m) => m.ResponsiveBar),
  { ssr: false },
)

const periods = DateRange.getPeriods()

class PagesVisits extends Component {
  constructor(props) {
    super(props)
    this.state = {
      period: "month",
      pagesStats: [],
      sortBy: null,
      sortAscending: false,
      showGraph: false,
    }
  }

  componentDidMount() {
    this.fetchPagesStats()
  }

  getDataUrl = () => {
    const { period } = this.state
    return `${process.env.pagesStatsURL}${
      periods[period].from
    },${DateRange.getPastDate(0)}`
  }

  async fetchPagesStats() {
    const pagesStats = await Fetch.getJSON(this.getDataUrl())

    for (const element of pagesStats) {
      if (element.label == "simulation") {
        const result = []
        this.flatten(result, element.subtable)
        this.setState(
          { pagesStats: result },
          this.sortTable("exit_nb_visits", false),
        )
      }
    }
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
          exit_rate: element.exit_rate.replace(/%/g, ""),
        })
      }
    }
  }

  sortTable(sortingBy, forcedSortAscending) {
    let sortAscending
    if (forcedSortAscending !== undefined) {
      sortAscending = forcedSortAscending
    } else {
      sortAscending = DataFilter.getSortAscending(
        sortingBy,
        this.state.sortBy,
        this.state.sortAscending,
      )
    }

    const output = DataFilter.sort(
      this.state.pagesStats,
      sortingBy,
      sortAscending,
      ["label"],
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

  switchView() {
    this.setState({ showGraph: !this.state.showGraph })
  }

  changePeriod(value) {
    this.setState({ period: value }, () => {
      this.fetchPagesStats()
    })
  }

  render() {
    return (
      <>
        <h1 data-testid="title">Statistiques de visites</h1>
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
            <div className="flex flex-gap">
              <span>{this.state.pagesStats.length} pages</span>
              <ViewSwitch trigger={() => this.switchView()} />
            </div>
          </div>
        </div>

        <div className="flex flex-gap">
          {this.state.showGraph &&
            this.state.pagesStats.length > 0 &&
            this.state.pagesStats.map((page) => (
              <div key={page.label} className="chart-container">
                <h5>{page.label.replace("/", "/​")}</h5>
                <div className="chart">
                  <ResponsiveBar
                    data={[
                      {
                        value: page.nb_visits,
                        label: "Visites",
                        percentage: "",
                      },
                      {
                        value: page.exit_nb_visits,
                        label: "Sorties",
                        percentage: "",
                      },
                    ]}
                    maxValue={page.nb_visits}
                    indexBy="label"
                    keys={["value"]}
                    isInteractive={false}
                    margin={{ top: 15, right: 10, bottom: 50, left: 60 }}
                    padding={0.3}
                    colors={({ data }) => Config.pageEventColors[data.label]}
                    borderColor={{
                      from: "color",
                      modifiers: [["darker", 1.6]],
                    }}
                    animate={false}
                  />
                </div>
              </div>
            ))}
        </div>

        {!this.state.showGraph && (
          <table data-testid="visits-table">
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
                  <div
                    className={`sortable ${this.sortState("exit_nb_visits")}`}
                  >
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
                    <td className="text-truncate-ellipsis">{page.label}</td>
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
        )}
      </>
    )
  }
}

export default PagesVisits
