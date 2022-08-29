import { Component } from "react"

import { Config } from "../services/config.js"
import Fetch from "../services/fetch.js"
import Url from "../services/url.js"
import DataFilter from "../services/dataFilter.js"
import DateRange from "../services/date.js"

const sources = {
  //    nb_uniq_visitors: 'Visiteur unique', // Non fonctionnel avec les données mensuelles
  nb_visits: "Visite",
  nb_events: "Évènement",
}

const SHOW_CATEGORY = "Affiché"
const SHOW_DETAILS_CATEGORY = "Détails affichés"
const ACTIONABLE_CATEGORY = "Actionné"
const INELIGIBLE_ACTIONABLE_CATEGORY = "Actionné inélig."
const MISUNDERSTOOD_CATEGORY = "Incompris"
const EXPLAIN_CATEGORY = "Expliqué"

const PERCENTAGE_ANNOTATION = {
  [SHOW_DETAILS_CATEGORY]: {
    annotation: "(1)",
    description:
      "Pourcentage calculé à partir du nombre de fois où l'aide a été affiché.",
  },
  [ACTIONABLE_CATEGORY]: {
    annotation: "(2)",
    description:
      "Pourcentage calculé à partir du nombre de fois où le détail de l'aide a été affiché.",
  },
}

const catMapping = {
  show: { cat: SHOW_CATEGORY, color: "#1f77b4" },
  showDetails: { cat: SHOW_DETAILS_CATEGORY, color: "#ff7f0e" },
  form: { cat: ACTIONABLE_CATEGORY, name: "Formulaire", color: "#2ca02c" },
  instructions: {
    cat: ACTIONABLE_CATEGORY,
    name: "Instructions",
    color: "#d62728",
  },
  link: { cat: ACTIONABLE_CATEGORY, name: "Lien", color: "#9467bd" },
  msa: { cat: ACTIONABLE_CATEGORY, name: "MSA", color: "#8c564b" },
  "show-locations": {
    cat: ACTIONABLE_CATEGORY,
    name: "Agence",
    color: "#e377c2",
  },
  teleservice: {
    cat: ACTIONABLE_CATEGORY,
    name: "Téléservice",
    color: "#7f7f7f",
  },
  "link-ineligible": {
    cat: INELIGIBLE_ACTIONABLE_CATEGORY,
    name: "Lien sans éligibilité",
    color: "#bcbd22",
  },
  "show-unexpected": { cat: MISUNDERSTOOD_CATEGORY, color: "#17becf" },
  close: { cat: EXPLAIN_CATEGORY, name: "Fermé", color: "#1f77b4" },
  "retour-logement": {
    cat: EXPLAIN_CATEGORY,
    name: "Retour page logement",
    color: "#ff7f0e",
  },
  "simulation-caf": {
    cat: EXPLAIN_CATEGORY,
    name: "Simulateur CAF",
    color: "#2ca02c",
  },
  email: { cat: EXPLAIN_CATEGORY, name: "Email", color: "#d62728" },
}
const filteredCatMapping = {}
const periods = DateRange.getPeriods()

class Behaviours extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: null,
      period: "day",
      source: "nb_visits",
      institutions: [],
      benefits: [],
      filteredBenefits: [],
      currentInstitutionType: "*",
      currentInstitution: "*",
      surveyDetails: [],
      undisplayedBenefits: [],
      sortBy: null,
      sortAscending: false,
      showGraph: false,
    }
  }

  async componentDidMount() {
    this.fetchUsersBehavioursData()
  }

  async fetchUsersBehavioursData() {
    let matomoEvents = await Fetch.getJSON(
      `${process.env.matomoEvents}${
        periods[this.state.period].from
      },${DateRange.getPastDate(0)}`
    )

    const { benefits, institutions } = await Fetch.benefits()

    const benefitsMap = {}
    const benefitsLabelIdMap = {}
    benefits.map((institutionGroup) => {
      if (benefitsMap[institutionGroup.id]) {
        benefitsMap[institutionGroup.id].institutions.push(
          institutionGroup.institution.id
        )
      } else {
        benefitsMap[institutionGroup.id] = {
          institutions: [institutionGroup.institution.id],
          type: institutionGroup.institution.type,
        }
        benefitsLabelIdMap[institutionGroup.label] = institutionGroup.id
      }
    })
    let benefitsList = {}
    // Add benefits event to existing object or create it
    matomoEvents.forEach((benefit) => {
      if (!benefitsMap[benefit.label] && !benefitsLabelIdMap[benefit.label])
        return
      // Normalize the use of benefit ID and benefit Label
      let index = benefitsLabelIdMap[benefit.label]
        ? benefitsLabelIdMap[benefit.label]
        : benefit.label
      if (benefitsList[index]) {
        for (let key in benefit.subtable) {
          let label = benefit.subtable[key].label
          if (benefitsList[index].events[label]) {
            benefitsList[index].events[label] +=
              benefit.subtable[key][this.state.source] || 0
          } else {
            if (catMapping[label] && benefit.subtable[key]) {
              benefitsList[index].events[label] =
                benefit.subtable[key][this.state.source] || 0
              filteredCatMapping[label] = catMapping[label]
            }
          }
          benefitsList[index].total += benefit[this.state.source] || 0
        }
        return
      } else {
        benefitsList[index] = benefitsMap[index]
        benefitsList[index].events = {}
        benefitsList[index].percentageOfEvents = {}
        for (let key in benefit.subtable) {
          let label = benefit.subtable[key].label
          if (catMapping[label] && benefit.subtable[key][this.state.source]) {
            benefitsList[index].events[label] =
              benefit.subtable[key][this.state.source] || 0
            filteredCatMapping[label] = catMapping[label]
          }
        }
      }
      benefitsList[index].total = benefit[this.state.source] || 0
      return
    })

    benefitsList = Object.keys(benefitsList).map((key) => {
      benefitsList[key].label = key
      return benefitsList[key]
    })

    // Filter out displayed benefits
    benefitsList.forEach((benefit) => {
      if (benefit.id && benefitsMap[benefit.id]) {
        delete benefitsMap[benefit.id]
      } else if (benefit.label && benefitsMap[benefit.label]) {
        delete benefitsMap[benefit.label]
      }
    })

    benefitsList.forEach((_, index) => {
      Object.keys(benefitsList[index].events).forEach((key) => {
        switch (catMapping[key].cat) {
          case SHOW_CATEGORY:
            break
          case SHOW_DETAILS_CATEGORY:
            benefitsList[index].percentageOfEvents[key] = this.percent(
              benefitsList[index].events[key],
              benefitsList[index].events.show
            )
            break
          case ACTIONABLE_CATEGORY:
            benefitsList[index].percentageOfEvents[key] = this.percent(
              benefitsList[index].events[key],
              benefitsList[index].events.showDetails
            )
            break
          default:
        }
      })
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

  eventSortName(eventName) {
    return eventName === "show"
      ? `events.${eventName}`
      : `percentageOfEvents.${eventName}`
  }

  sortTable(sortingBy) {
    Object.keys(filteredCatMapping).map((eventName) =>
      console.log(this.eventSortName(eventName))
    )

    const { output, sortAscending } = DataFilter.sort(
      this.state.benefits,
      sortingBy,
      this.state.sortBy,
      this.state.sortAscending,
      ["label"],
      Object.keys(filteredCatMapping).map((eventName) =>
        this.eventSortName(eventName)
      )
    )

    this.setState({
      sortAscending: sortAscending,
      sortBy: sortingBy,
      filteredBenefits: output,
    })
  }

  sortState(sortingBy) {
    if (sortingBy == this.state.sortBy) {
      return this.state.sortAscending ? "sortable-asc" : "sortable-desc"
    }
  }

  percent(n, t) {
    return Math.min(Math.round(((n || 0) / (t || 1)) * 100), 100)
  }

  switchView() {
    this.setState({ showGraph: !this.state.showGraph })
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
                      {periods[k].label}
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
        </div>

        {!this.state.showGraph && (
          <div className="table-container">
            <table className="collapsable">
              <thead>
                <tr>
                  <th onClick={() => this.sortTable("label")}>
                    <div className={`sortable ${this.sortState("label")}`}>
                      Nom de l'aide
                    </div>
                  </th>
                  {Object.keys(filteredCatMapping).map((key) => (
                    <th
                      key={key}
                      onClick={() => this.sortTable(this.eventSortName(key))}
                    >
                      <div
                        className={`sortable ${this.sortState(
                          this.eventSortName(key)
                        )}`}
                      >
                        {filteredCatMapping[key].name ||
                          filteredCatMapping[key].cat ||
                          key}
                        {PERCENTAGE_ANNOTATION[catMapping[key].cat] && (
                          <sup>
                            {
                              PERCENTAGE_ANNOTATION[catMapping[key].cat]
                                .annotation
                            }
                          </sup>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {this.state.filteredBenefits.map((benefit) => (
                  <tr key={benefit.id || benefit.label}>
                    <td data-label="Aide" data-content="aide">
                      {benefit.id || benefit.label}
                    </td>
                    {Object.keys(filteredCatMapping).map((key) => (
                      <td
                        data-label={
                          filteredCatMapping[key].name ||
                          filteredCatMapping[key].cat
                        }
                        data-content={benefit.events[key]}
                        className="text-right"
                        key={key}
                      >
                        {key === "show" ? (
                          <>{benefit.events.show}</>
                        ) : (
                          <>
                            <div
                              className="gauge"
                              style={{
                                width: `${benefit.percentageOfEvents[key]}%`,
                                background: filteredCatMapping[key].color,
                              }}
                            ></div>
                            {benefit.events[key]}
                            {benefit.events[key] && (
                              <small>
                                ({benefit.percentageOfEvents[key]}%)
                              </small>
                            )}
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {Object.values(PERCENTAGE_ANNOTATION).map((annotation) => {
          return (
            <div key={annotation.annotation}>
              <i>
                {annotation.annotation} {annotation.description}
              </i>
            </div>
          )
        })}

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
