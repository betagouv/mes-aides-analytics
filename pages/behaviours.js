import { Component } from "react"

import {
  Config,
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
    let recorderStatistics = await Fetch.getRecorderStatistics(
      periods[this.state.period].from
    )
    const { benefits, benefitInstitutionMapping, institutions } =
      await Fetch.getBenefitsAndInstitutions()

    const benefitIds = benefits.map((benefit) => benefit.id)
    recorderStatistics = recorderStatistics.filter((benefitStatistic) =>
      benefitIds.includes(benefitStatistic.id)
    )

    const displayedBenefits = recorderStatistics.map((benefit) => benefit.id)
    const undisplayedBenefits = benefitIds.filter(
      (benefit) => displayedBenefits.indexOf(benefit) === -1
    )

    recorderStatistics = recorderStatistics.map((benefitStatistic) => {
      const { events } = benefitStatistic
      const institution = benefitInstitutionMapping[benefitStatistic.id]
      const percentageOfEvents = {}

      Object.keys(events).forEach((event_name) => {
        if (!EventTypeCategoryMapping[event_name]) {
          return
        }

        switch (EventTypeCategoryMapping[event_name].cat) {
          case EventCategories.SHOW_DETAILS:
            percentageOfEvents[event_name] = this.percent(
              events[event_name],
              events.show
            )
            break
          case EventCategories.ACTIONABLE:
            percentageOfEvents[event_name] = this.percent(
              events[event_name],
              events.showDetails
            )
            break
          default:
            break
        }
      })

      return {
        label: benefitStatistic.id,
        events: events,
        institution: institution.label,
        type: institution.type,
        percentageOfEvents,
      }
    })

    this.setState({
      benefits: recorderStatistics,
      filteredBenefits: recorderStatistics,
      institutions: institutions,
      undisplayedBenefits,
    })

    const parameters = Url.getParameters(["geographic", "institution"])
    this.filterBenefits(
      parameters.geographic || "*",
      parameters.institution || "*"
    )

    this.sortTable("events.show")
  }

  handlePeriodChange(period) {
    this.setState({ period: period }, this.fetchUsersBehavioursData)
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
    const sortAscending = DataFilter.getSortAscending(
      sortingBy,
      this.state.sortBy,
      this.state.sortAscending
    )

    const output = DataFilter.sort(
      this.state.benefits,
      sortingBy,
      sortAscending,
      ["label"],
      Object.keys(EventTypeCategoryMapping).map((eventName) =>
        this.eventSortName(eventName)
      ),
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
