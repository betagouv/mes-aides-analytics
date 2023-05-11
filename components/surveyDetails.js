import { Component } from "react"
import { ResponsiveBar } from "@nivo/bar"

import ViewSwitch from "../components/viewSwitch.js"

import { Config } from "../services/config.js"
import Url from "../services/url.js"
import DataFilter from "../services/dataFilter.js"

const categories = {
  id: "Aides",
  total: "Réponses",
  asked: "Demandes réussies",
  failed: "Demandes échouées",
  nothing: "Pas de demande",
  already: "Déjà perçues",
}

class SurveyDetails extends Component {
  constructor(props) {
    super(props)
    this.state = {
      surveyDetails: props.survey,
      institutions: props.institutions,
      currentInstitutionType: "*",
      currentInstitution: "*",
      filteredInstitutions: [],
      filteredBenefits: [],
      sortBy: null,
      sortAscending: false,
      showGraph: false,
    }
  }

  async componentDidMount() {
    const parameters = Url.getParameters(["geographic", "institution"])
    this.filterBenefits(
      parameters.geographic || "*",
      parameters.institution || "*"
    )
  }

  filterBenefits(geographic = "*", institution = "*") {
    this.setState(
      DataFilter.benefits(
        this.state.surveyDetails,
        this.state.institutions,
        geographic,
        institution
      ),
      () => this.sortTable("total")
    )
  }

  sortState(sortingBy) {
    if (sortingBy == this.state.sortBy) {
      return this.state.sortAscending ? "sortable-asc" : "sortable-desc"
    }
  }

  sortTable(sortingBy) {
    const sortAscending = DataFilter.getSortAscending(
      sortingBy,
      this.state.sortBy,
      this.state.sortAscending
    )

    const output = DataFilter.sort(
      this.state.filteredBenefits,
      sortingBy,
      sortAscending,
      ["id"]
    )

    this.setState({
      sortAscending: sortAscending,
      sortBy: sortingBy,
      filteredBenefits: output,
    })
  }

  switchView() {
    this.setState({ showGraph: !this.state.showGraph })
  }

  percent(n, t) {
    return `${Math.round(((n || 0) / (t || 1)) * 100)}%`
  }

  graphMap(benefit) {
    return ["asked", "failed", "nothing", "already"].map((category) => {
      const value = benefit[category] || 0
      return {
        value,
        percentage: (100 * value) / benefit["total"],
        label: category,
        category: Config.surveyLabels[category].single,
      }
    })
  }

  render() {
    return (
      <div>
        <h3>Détails des résultats du sondage par prestation</h3>

        <div className="flex flex-gap flex-justify">
          <div>
            <div className="flex flex-gap">
              {this.state.institutions && (
                <select
                  onChange={(e) => this.filterBenefits(e.target.value)}
                  value={this.state.currentInstitutionType}
                >
                  {Config.institutionsType.map((type) => (
                    <option value={type.value} key={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              )}

              {this.state.filteredInstitutions && (
                <select
                  onChange={(e) =>
                    this.filterBenefits(
                      this.state.currentInstitutionType,
                      e.target.value
                    )
                  }
                  value={this.state.currentInstitution}
                >
                  <option value="*">Toutes les institutions</option>
                  {this.state.filteredInstitutions.map((institution) => (
                    <option value={institution} key={institution}>
                      {institution}
                    </option>
                  ))}
                </select>
              )}

              {(this.state.currentInstitutionType != "*" ||
                this.state.currentInstitution != "*") && (
                <input type="reset" onClick={() => this.filterBenefits()} />
              )}
            </div>
          </div>
          <div>
            <div className="flex flex-gap">
              <span>{this.state.filteredBenefits.length} aides</span>
              <ViewSwitch trigger={() => this.switchView()} />
            </div>
          </div>
        </div>

        <div className="flex">
          {this.state.showGraph &&
            this.state.filteredBenefits.map((benefit) => (
              <div className="chart-container" key={benefit.id}>
                <h4>
                  {benefit.id}
                  <small>sur {benefit.total} réponses</small>
                </h4>
                <div className="chart">
                  <ResponsiveBar
                    axisLeft={{
                      format: (value) => `${Number(value)} %`,
                    }}
                    maxValue={100}
                    label={({ data }) => data.value}
                    data={this.graphMap(benefit)}
                    keys={["percentage"]}
                    indexBy="category"
                    colors={({ data }) =>
                      Config.surveyLabels[data.label].lightColor
                    }
                    isInteractive={false}
                    margin={{ top: 15, right: 10, bottom: 50, left: 60 }}
                    padding={0.3}
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
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {Object.keys(categories).map((key) => (
                    <th key={key} onClick={() => this.sortTable(key)}>
                      <div className={`sortable ${this.sortState(key)}`}>
                        {categories[key]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {this.state.filteredBenefits.map((benefit) => (
                  <tr key={benefit.id}>
                    <td data-label={categories["id"]}>
                      {benefit.id && (
                        <a
                          href={`${process.env.benefitDetailURL}${benefit.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {benefit.id.replace(/(-|_)/gm, " ")}
                        </a>
                      )}
                      {benefit.label && (
                        <>{benefit.label.replace(/(-|_)/gm, " ")}</>
                      )}
                    </td>
                    <td data-label={categories["total"]} className="text-right">
                      {benefit.total} réponses
                    </td>

                    {Object.keys(Config.surveyLabels).map((key) => (
                      <td
                        data-label={categories[key]}
                        key={key}
                        className="text-right"
                      >
                        <div
                          className="gauge"
                          style={{
                            width: this.percent(benefit[key], benefit.total),
                            background: Config.surveyLabels[key].color,
                          }}
                        ></div>
                        {benefit[key] || 0}
                        <small>
                          ({this.percent(benefit[key], benefit.total)})
                        </small>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }
}

export default SurveyDetails
