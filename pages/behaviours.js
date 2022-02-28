import { Component } from "react"
import SurveyResults from "../components/surveyResults.js"

import { Config } from "../services/config.js"
import Fetch from "../services/fetch.js"
import Url from "../services/url.js"
import DataFilter from "../services/dataFilter.js"

const periods = {
  day: "Hier",
  month: "Mois dernier",
  year: new Date().getFullYear().toString(),
}

const sources = {
  //    nb_uniq_visitors: 'Visiteur unique', // Non fonctionnel avec les données mensuelles
  nb_visits: "Visite",
  nb_events: "Évènement",
}

const catMapping = {
  show: { cat: "Affiché", color: "#1f77b4" },
  showDetails: { cat: "Détails affichés", color: "#ff7f0e" },
  form: { cat: "Actionné", name: "Formulaire", color: "#2ca02c" },
  instructions: { cat: "Actionné", name: "Instructions", color: "#d62728" },
  link: { cat: "Actionné", name: "Lien", color: "#9467bd" },
  msa: { cat: "Actionné", name: "MSA", color: "#8c564b" },
  "show-locations": { cat: "Actionné", name: "Agence", color: "#e377c2" },
  teleservice: { cat: "Actionné", name: "Téléservice", color: "#7f7f7f" },
  "link-ineligible": {
    cat: "Actionné inélig.",
    name: "Lien sans éligibilité",
    color: "#bcbd22",
  },
  "show-unexpected": { cat: "Incompris", color: "#17becf" },
  close: { cat: "Expliqué", name: "Fermé", color: "#1f77b4" },
  "retour-logement": {
    cat: "Expliqué",
    name: "Retour page logement",
    color: "#ff7f0e",
  },
  "simulation-caf": {
    cat: "Expliqué",
    name: "Simulateur CAF",
    color: "#2ca02c",
  },
  email: { cat: "Expliqué", name: "Email", color: "#d62728" },
}
const filteredCatMapping = {}

class Behaviours extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: null,
      period: "year",
      source: "nb_visits",
      institutions: [],
      benefits: [],
      filteredBenefits: [],
      currentInstitutionType: "*",
      currentInstitution: "*",
      surveyDetails: [],
      undisplayedBenefits: [],
    }
  }

  async componentDidMount() {
    this.fetchUsersBehavioursData()
  }

  async fetchUsersBehavioursData() {
    let matomoEvents = await Fetch.getJSON(
      `${process.env.matomoEvents}${this.state.period}`
    )

    const { benefits, institutions } = await Fetch.benefits()

    const benefitsMap = {}
    benefits.map((institutionGroup) => {
      if (benefitsMap[institutionGroup.label]) {
        benefitsMap[institutionGroup.label].instutions.push(
          institutionGroup.institution.benefitsIds
        )
      } else {
        benefitsMap[institutionGroup.label] = {
          instutions: institutionGroup.institution.benefitsIds,
          type: institutionGroup.institution.type,
        }
      }
    })
    let benefitsList = {}
    const result = matomoEvents.map((benefit) => {
      if (!benefitsMap[benefit.label]) return
      if (benefitsList[benefit.label]) {
        for (let key in benefit.subtable) {
          let label = benefit.subtable[key].label
          if (benefitsList[benefit.label].events[label]) {
            benefitsList[benefit.label].events[label] +=
              benefit.subtable[key][this.state.source] || 0
          } else {
            if (catMapping[label] && benefit.subtable[key]) {
              benefitsList[benefit.label].events[label] =
                benefit.subtable[key][this.state.source] || 0
              filteredCatMapping[label] = catMapping[label]
            }
          }
          benefitsList[benefit.label].total += benefit[this.state.source] || 0
        }
        return benefit[this.state.source]
      } else {
        benefitsList[benefit.label] = benefitsMap[benefit.label]
        benefitsList[benefit.label].events = {}
        for (let key in benefit.subtable) {
          let label = benefit.subtable[key].label
          if (catMapping[label] && benefit.subtable[key][this.state.source]) {
            benefitsList[benefit.label].events[label] =
              benefit.subtable[key][this.state.source] || 0
            filteredCatMapping[label] = catMapping[label]
          }
        }
        benefitsList[benefit.label].total = benefit[this.state.source] || 0
      }
      return benefit
    })
    benefitsList = Object.keys(benefitsList).map((key) => {
      benefitsList[key].label = key
      return benefitsList[key]
    })

    // Filter out displayed benefits
    benefitsList.map((benefit) => {
      if (benefit.label && benefitsMap[benefit.label]) {
        delete benefitsMap[benefit.label]
      }
    })

    this.setState({
      benefits: benefitsList,
      filteredBenefits: benefitsList,
      institutions: institutions,
      undisplayedBenefits: Object.keys(benefitsMap),
    })

    const parameters = Url.getParameters(["geographic", "institution"])
    this.filterBenefits(
      parameters.geographic || "*",
      parameters.institution || "*"
    )
  }

  handlePeriodChange(period) {
    this.setState({ period: period }, this.fetchUsersBehavioursData)
  }

  handleSourceChange(source) {
    this.setState({ source: source }, this.fetchUsersBehavioursData)
  }

  filterBenefits(geographic = "*", institution = "*") {
    this.setState(
      DataFilter.benefits(
        this.state.benefits,
        this.state.institutions,
        geographic,
        institution
      )
    )
  }

  percent(n, t) {
    return `${Math.round(((n || 0) / (t || 1)) * 100)}%`
  }

  render() {
    return (
      <>
        <h2>Comportements utilisateur sur la page de résultats</h2>
        <div>
          <p>
            Les graphiques suivants représentent les taux de conversion sur la
            page de présentation de résultats sur le simulateur. Différents
            évènements sont capturés pour mieux évaluer l'impact du simulateur
            sur le non-recours aux dispositifs présentés aux usagers.
          </p>
        </div>

        <div className="flex-justify">
          <div className="flex-bottom flex-gap">
            <label>
              <span>Période de référence</span>
              <br />
              <select
                onChange={(event) =>
                  this.handlePeriodChange(event.target.value)
                }
                value={this.state.period}
              >
                {Object.keys(periods).map((k) => {
                  return (
                    <option key={k} value={k}>
                      {periods[k]}
                    </option>
                  )
                })}
              </select>
            </label>

            <label>
              <span>Source des données</span>
              <br />
              <select
                onChange={(event) =>
                  this.handleSourceChange(event.target.value)
                }
                value={this.state.source}
              >
                {Object.keys(sources).map((k) => {
                  return (
                    <option key={k} value={k}>
                      {sources[k]}
                    </option>
                  )
                })}
              </select>
            </label>

            {this.state.institutions && (
              <label>
                <span>Filtrer par géographie</span>
                <br />
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
              </label>
            )}

            {this.state.filteredInstitutions && (
              <label>
                <span>Filtrer par institution</span>
                <br />
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
              </label>
            )}

            {(this.state.currentInstitutionType != "*" ||
              this.state.currentInstitution != "*") && (
              <input type="reset" onClick={() => this.filterBenefits()} />
            )}
          </div>
          <div>
            <br />
            <span>{this.state.filteredBenefits.length} aides</span>
          </div>
        </div>

        <div className="list">
          <table>
            <thead>
              <tr>
                <th>Nom de l'aide</th>
                {Object.keys(filteredCatMapping).map((key) => (
                  <th key={key}>
                    {filteredCatMapping[key].name ||
                      filteredCatMapping[key].cat ||
                      key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {this.state.filteredBenefits.map((benefit) => (
                <tr key={benefit.label}>
                  <td>{benefit.label}</td>
                  {Object.keys(filteredCatMapping).map((key) => (
                    <td className="text-right" key={key}>
                      <div
                        className="gauge"
                        style={{
                          width: this.percent(
                            benefit.events[key],
                            benefit.total
                          ),
                          background: filteredCatMapping[key].color,
                        }}
                      ></div>
                      {benefit.events[key]}
                      {benefit.events[key] && (
                        <small>
                          ({this.percent(benefit.events[key], benefit.total)})
                        </small>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>Liste des aides non-affichées durant cette période</h2>
        <ul>
          {this.state.undisplayedBenefits.map((benefitName) => {
            return <li key={benefitName}>{benefitName}</li>
          })}
        </ul>
      </>
    )
  }
}

export default Behaviours
