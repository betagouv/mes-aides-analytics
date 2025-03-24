import { interceptUsageStatistics } from "../support/utils.js"

describe("Index Page", () => {
  beforeEach(() => {
    const interceptIdentifier = interceptUsageStatistics()
    cy.visitHome()
    cy.wait(interceptIdentifier, {timeout: 15000})
  })

  it("passes axe accessibility", () => {
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
})
