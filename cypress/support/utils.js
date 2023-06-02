import configuration from "../../next.config.js"

export function interceptUsageStatistics() {
  const interceptIdentifier = "fetchData"
  cy.intercept("GET", configuration.env.usageStatisticsURL, {
    fixture: "usageStatistics.json",
  }).as(interceptIdentifier)

  return `@${interceptIdentifier}`
}
