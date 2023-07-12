import configuration from "../../next.config.js"

function createFetchInterceptor(interceptIdentifier, url, fixture) {
  return function () {
    cy.intercept("GET", url, {
      fixture: fixture,
    }).as(interceptIdentifier)

    return `@${interceptIdentifier}`
  }
}

export const interceptUsageStatistics = createFetchInterceptor(
  "interceptUsageStatistics",
  configuration.env.usageStatisticsURL,
  "usageStatistics.json",
)

export const interceptSurveyStatistics = createFetchInterceptor(
  "interceptSurveyStatistics",
  configuration.env.surveyStatisticsURL,
  "surveyStatistics.json",
)

export const interceptRecorderStatistics = createFetchInterceptor(
  "interceptRecorderStatistics",
  new RegExp(`${configuration.env.recorderStatisticsURL}/benefits?.*`),
  "recorderStatistics.json",
)

export const interceptBenefits = createFetchInterceptor(
  "interceptBenefits",
  configuration.env.benefitsURL,
  "benefits.json",
)

export const interceptPagesStats = createFetchInterceptor(
  "interceptPagesStats",
  new RegExp(`${configuration.env.pagesStatsURL.replace("?", "\\?")}.*`),
  "pagesStats.json",
)
