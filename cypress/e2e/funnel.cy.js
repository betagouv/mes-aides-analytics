import { interceptAidesJeunesStatistics } from "../support/utils.js"

describe("Funnel Page", () => {
  beforeEach(() => {
    const interceptIdentifier = interceptAidesJeunesStatistics()
    cy.visitFromHome("/funnel")
    cy.wait(interceptIdentifier)
  })

  it("passes axe accessibility", () => {
    cy.injectAxe()
    cy.checkA11y()
  })

  it("displays the menu and title", () => {
    cy.checkMenu()
    cy.checkTitle()
  })

  it("displays funnel results chart", () => {
    cy.get(".responsive-chart").should("be.visible")
    cy.checkGraph("funnel-visits", "1ère Page", "127857")
    cy.checkGraph("funnel-visits", "2ème Page", "102925")
    cy.checkGraph("funnel-visits", "Page de Résultats", "76436")
  })
})
