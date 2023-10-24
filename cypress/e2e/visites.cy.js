import { interceptPagesStats } from "../support/utils.js"

describe("Visites Page", () => {
  beforeEach(() => {
    const interceptIdentifier = interceptPagesStats()
    cy.visitFromHome("/pages")
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

  it("fetches data and populates table", () => {
    cy.checkTable(
      "visits-table",
      0,
      "/individu/demandeur/ressources/montants/revenusActivite",
    )
    cy.checkTable("visits-table", 0, "426")
    cy.checkTable("visits-table", 0, "47")
  })
})
