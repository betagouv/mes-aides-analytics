import { Component } from "react"

import { Config } from "../services/config.js"
import Url from "../services/url.js"
import DataFilter from "../services/dataFilter.js"

const categories = {
  id: "Aides",
  total: "Total réponses",
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
    const { output, sortAscending } = DataFilter.sort(
      this.state.filteredBenefits,
      sortingBy,
      this.state.sortBy,
      this.state.sortAscending,
      ["id"],
      ["total", "asked", "failed", "nothing", "already"]
    )
    this.setState({
      sortAscending: sortAscending,
      sortBy: sortingBy,
      filteredBenefits: output,
    })
  }

  percent(n, t) {
    return `${Math.round(((n || 0) / (t || 1)) * 100)}%`
  }

  render() {
    return (
      <div>
        <h3>Détails des résultats du sondage par prestation</h3>
        <br />
        {
          <div>
            <div className="flex-justify">
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
              <div>
                <span>{this.state.filteredBenefits.length} aides</span>
              </div>
            </div>
            {<div className="table-container">
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
                      <td>{((benefit.id && benefit.label) || benefit.id).replace(/(-|_)/gm, " ")}</td>
                      <td className="text-right">{benefit.total} réponses</td>

                      {Object.keys(Config.surveyLabels).map((key) => (
                        <td key={key} className="text-right">
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
            </div>}
          </div>
        }
      </div>
    )
  }
}

export default SurveyDetails
