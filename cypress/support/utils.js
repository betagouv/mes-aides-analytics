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
  "usageStatistics.json"
)

export const interceptSurveyStatistics = createFetchInterceptor(
  "interceptSurveyStatistics",
  configuration.env.surveyStatisticsURL,
  "surveyStatistics.json"
)
