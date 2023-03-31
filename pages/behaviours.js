import { Component } from "react"

import {
  Config,
  DataSources,
  EventCategories,
  PercentageAnnotation,
  EventTypeCategoryMapping,
} from "../services/config.js"
import Fetch from "../services/fetch.js"
import Url from "../services/url.js"
import DataFilter from "../services/dataFilter.js"
import DateRange from "../services/date.js"

const periods = DateRange.getPeriods()

class Behaviours extends Component {
  constructor(props) {
    super(props)
    this.state = {
      period: "day",
      source: "nb_visits",
      institutions: [],
      benefits: [],
      filteredBenefits: [],
      currentInstitutionType: "*",
      currentInstitution: "*",
      undisplayedBenefits: [],
      sortBy: null,
      sortAscending: false,
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
            if (EventTypeCategoryMapping[label] && benefit.subtable[key]) {
              benefitsList[index].events[label] =
                benefit.subtable[key][this.state.source] || 0
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
          if (
            EventTypeCategoryMapping[label] &&
            benefit.subtable[key][this.state.source]
          ) {
            benefitsList[index].events[label] =
              benefit.subtable[key][this.state.source] || 0
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
        switch (EventTypeCategoryMapping[key].cat) {
          case EventCategories.SHOW:
            break
          case EventCategories.SHOW_DETAILS:
            benefitsList[index].percentageOfEvents[key] = this.percent(
              benefitsList[index].events[key],
              benefitsList[index].events.show
            )
            break
          case EventCategories.ACTIONABLE:
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
    const { output, sortAscending } = DataFilter.sort(
      this.state.benefits,
      sortingBy,
      this.state.sortBy,
      this.state.sortAscending,
      ["label"],
      Object.keys(EventTypeCategoryMapping).map((eventName) =>
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

  percent(numerator, denominator) {
    return Math.min(
      Math.round(((numerator || 0) / (denominator || 1)) * 100),
      100
    )
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
                {Object.keys(DataSources).map((k) => {
                  return (
                    <option key={k} value={k}>
                      {DataSources[k]}
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

        <div className="table-container">
          <table className="collapsable">
            <thead>
              <tr>
                <th onClick={() => this.sortTable("label")}>
                  <div className={`sortable ${this.sortState("label")}`}>
                    Nom de l'aide
                  </div>
                </th>
                {Object.keys(EventTypeCategoryMapping).map((key) => (
                  <th
                    key={key}
                    onClick={() => this.sortTable(this.eventSortName(key))}
                  >
                    <div
                      className={`sortable ${this.sortState(
                        this.eventSortName(key)
                      )}`}
                    >
                      {EventTypeCategoryMapping[key].name ||
                        EventTypeCategoryMapping[key].cat ||
                        key}
                      {PercentageAnnotation[
                        EventTypeCategoryMapping[key].cat
                      ] && (
                        <sup>
                          {
                            PercentageAnnotation[
                              EventTypeCategoryMapping[key].cat
                            ].annotation
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
                  {Object.keys(EventTypeCategoryMapping).map((key) => (
                    <td
                      data-label={
                        EventTypeCategoryMapping[key].name ||
                        EventTypeCategoryMapping[key].cat
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
                              background: EventTypeCategoryMapping[key].color,
                            }}
                          ></div>
                          {benefit.events[key]}
                          {benefit.events[key] && (
                            <small>({benefit.percentageOfEvents[key]}%)</small>
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

        {Object.values(PercentageAnnotation).map((annotation) => {
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
