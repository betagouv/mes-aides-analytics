import { Component } from "react"

import BehavioursHeader from "../components/behaviourHeader.js"
import UndisplayedBenefits from "../components/undisplayedBenefits.js"

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
const DEFAULT_SORT_BY = "events.show"
const DEFAULT_SORT_ASCENDING = false
const ALPHABETICAL_COLUMNS = ["label"]

class Behaviours extends Component {
  constructor(props) {
    super(props)
    this.state = {
      period: "day",
      institutions: [],
      benefits: [],
      filteredBenefits: [],
      currentInstitutionType: DataFilter.DEFAULT_FILTER_VALUE,
      currentInstitution: DataFilter.DEFAULT_FILTER_VALUE,
      undisplayedBenefits: [],
      sortBy: null,
      sortAscending: false,
      loading: true,
    }
  }

  async componentDidMount() {
    this.fetchUsersBehavioursData()
  }

  async fetchUsersBehavioursData() {
    this.setState({ loading: true })

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

    const parameters = Url.getParameters(["institution_type", "institution"])

    const {
      institution_type,
      institution,
    } = parameters

    const filterState = DataFilter.benefits(
      recorderStatistics,
      institutions,
      institution_type || DataFilter.DEFAULT_FILTER_VALUE,
      institution || DataFilter.DEFAULT_FILTER_VALUE
    )

    const sortedFilteredBenefits = DataFilter.sort(
      filterState.filteredBenefits,
      DEFAULT_SORT_BY,
      DEFAULT_SORT_ASCENDING,
      ALPHABETICAL_COLUMNS
    )

    this.setState({
      benefits: recorderStatistics,
      institutions: institutions,
      undisplayedBenefits,
      loading: false,
      ...filterState,
      filteredBenefits: sortedFilteredBenefits,
      sortBy: DEFAULT_SORT_BY,
      sortAscending: DEFAULT_SORT_ASCENDING,
    })
  }

  handlePeriodChange(period) {
    this.setState({ period: period }, this.fetchUsersBehavioursData)
  }

  filterBenefits(
    institution_type = DataFilter.DEFAULT_FILTER_VALUE,
    institution = DataFilter.DEFAULT_FILTER_VALUE
  ) {
    this.setState(
      DataFilter.benefits(
        this.state.benefits,
        this.state.institutions,
        institution_type,
        institution
      )
    )
  }

  eventSortName(eventName) {
    return eventName === "show"
      ? `events.${eventName}`
      : `percentageOfEvents.${eventName}`
  }

  sortTable(sortingBy, autoSwtichAscending = true) {
    const sortAscending = autoSwtichAscending
      ? DataFilter.getSortAscending(
          sortingBy,
          this.state.sortBy,
          this.state.sortAscending
        )
      : this.state.sortAscending

    const output = DataFilter.sort(
      this.state.filteredBenefits,
      sortingBy,
      sortAscending,
      ALPHABETICAL_COLUMNS
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

  displayResetButton() {
    return (
      this.state.currentInstitutionType !== DataFilter.DEFAULT_FILTER_VALUE ||
      this.state.currentInstitution !== DataFilter.DEFAULT_FILTER_VALUE
    )
  }

  render() {
    return (
      <>
        <BehavioursHeader />
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
                <span>Filtrer par type d'institution</span>
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
                  <option value="{DataFilter.DEFAULT_FILTER_VALUE}">
                    Toutes les institutions
                  </option>
                  {this.state.filteredInstitutions.map((institution) => (
                    <option value={institution} key={institution}>
                      {institution}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {this.displayResetButton() && (
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
              {this.state.loading && (
                <tr>
                  <td
                    colSpan={Object.keys(EventTypeCategoryMapping).length + 1}
                  >
                    <span className="loading">Chargement en cours...</span>
                  </td>
                </tr>
              )}
              {!this.state.loading &&
                this.state.filteredBenefits.map((benefit) => (
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

        {Object.values(PercentageAnnotation).map((annotation) => {
          return (
            <div key={annotation.annotation}>
              <i>
                {annotation.annotation} {annotation.description}
              </i>
            </div>
          )
        })}

        <UndisplayedBenefits
          undisplayedBenefits={this.state.undisplayedBenefits}
        />
      </>
    )
  }
}

export default Behaviours
