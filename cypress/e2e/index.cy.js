import {
  interceptUsageStatistics,
  interceptRegionStatistics,
} from "../support/utils.js"

describe("Index Page", () => {
  beforeEach(() => {
    const interceptIdentifier = interceptUsageStatistics()
    const interceptRegionIdentifier = interceptRegionStatistics()
    cy.visitHome()
    cy.wait(interceptIdentifier, { timeout: 15000 })
    cy.wait(interceptRegionIdentifier, { timeout: 15000 })
  })

  it("passes axe accessibility", () => {
    cy.get('[data-testid="kpi-grid"]').should("be.visible")
    cy.injectAxe()
    cy.checkA11y()
  })

  it("displays the menu and title", () => {
    cy.checkMenu()
    cy.checkTitle()
  })

  it("fetches data and populates bar graph", () => {
    // related to nb_visites in fixtures/usage_statistics.json
    cy.checkGraph("visites", "2021-09", "82874")
    // related to nb_visits_converted in fixtures/usage_statistics.json
    cy.checkGraph("simulations", "2021-09", "49512")
  })

  it("fetches data and displays the region heatmap", () => {
    cy.get('[data-testid="region-heatmap"]').should("be.visible")
    cy.get('[data-testid="region-heatmap"] svg').should("exist")
  })
})
