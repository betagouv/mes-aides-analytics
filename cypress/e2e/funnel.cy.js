import { interceptAidesJeunesStatistics } from "../support/utils.js"

describe("Funnel Page", () => {
  beforeEach(() => {
    const interceptIdentifier = interceptAidesJeunesStatistics()
    cy.visitFromHome("/funnel")
    cy.wait(interceptIdentifier)
  })

  it("displays the menu and title", () => {
    cy.checkMenu()
    cy.checkTitle()
  })

  it("displays funnel results chart", () => {
    cy.get(".responsive-chart").should("be.visible")
    cy.checkGraph("funnel-visits", "Visites", "125821")
  })
})
