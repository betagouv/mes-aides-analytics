import { interceptAidesJeunesStatistics } from "../support/utils.js"

describe("Institution Page Functionalities", () => {
  beforeEach(() => {
    const interceptIdentifier = interceptAidesJeunesStatistics()
    cy.visitFromHome("/institutions")
    cy.wait(interceptIdentifier)
  })

  it("displays the navigation menu and page title", () => {
    cy.checkMenu()
    cy.checkTitle()
  })

  it("presents a chart with funnel results", () => {
    cy.checkTable("institutions-table", 0, "CC du Quercy Caussadais")
    cy.checkTable("institutions-table", 0, "248200057")
    cy.checkTable("institutions-table", 0, "CC")
    cy.checkTable("institutions-table", 0, "20937")
    cy.checkTable("institutions-table", 0, "0")
  })

  describe("Filtering Table By Institution Name", () => {
    beforeEach(() => {
      cy.get('[data-testid="filter-name"]').type("Tarn-et-Garonnaise")
    })

    it("shows entries matching the input name", () => {
      cy.checkTable(
        "institutions-table",
        0,
        "CC de la Lomagne Tarn-et-Garonnaise",
      )
    })
  })

  describe("Filtering Table By Institution Code", () => {
    beforeEach(() => {
      cy.get('[data-testid="filter-code"]').type("248200107")
    })

    it("displays entries corresponding to the input code", () => {
      cy.checkTable(
        "institutions-table",
        0,
        "CC du Quercy Rouergue et des Gorges de l'Aveyron",
      )
    })
  })

  describe("Filtering Table By Institution Type", () => {
    beforeEach(() => {
      cy.get('[data-testid="filter-type"]').select("CA")
    })

    it("reveals entries of the selected institution type", () => {
      cy.checkTable("institutions-table", 0, "CA Grand Montauban")
    })
  })

  describe("Sorting Table By Population", () => {
    beforeEach(() => {
      cy.get('[data-testid="column-population"]').click()
    })

    it("orders entries based on population", () => {
      cy.checkTable("institutions-table", 0, "CA Grand Montauban")
    })
  })
})
