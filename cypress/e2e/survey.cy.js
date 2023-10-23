import { interceptAidesJeunesStatistics } from "../support/utils.js"

describe("Survey Page", () => {
  beforeEach(() => {
    const interceptIdentifier = interceptAidesJeunesStatistics()
    cy.visitFromHome("/survey")
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

  it("displays survey results chart", () => {
    cy.get(".responsive-chart").should("be.visible")
    cy.checkGraph("survey-summary", "Demande réussie", "1329")
  })

  it("displays survey details", () => {
    cy.get("[data-testid=survey-details-table]").should("be.visible")

    cy.get("[data-testid=survey-details-table] tbody tr").should(
      "have.length",
      3,
    )
    cy.checkTable("survey-details-table", 0, "depart1825 montant maximum")
    cy.checkTable(
      "survey-details-table",
      1,
      "eure et loir eligibilite aide menagere personne handicap",
    )
    cy.checkTable("survey-details-table", 2, "gratuite musees monuments")
  })

  it("displays survey historical", () => {
    cy.get("[data-testid=survey-historical-title]").should("be.visible")
    cy.get("[data-testid=survey-historical-graph] div")
      .invoke("outerHeight")
      .should("be.greaterThan", 0)
    // related to historical values in fixtures/surveyStatistics.json
    cy.checkGraph("survey-historical-graph", "2022-08", "5")
  })

  context("when select a geographic area", () => {
    beforeEach(() => {
      cy.selectInstitutionType("departement")
    })

    it("displays filtered rows", () => {
      cy.get("[data-testid=survey-details-table] tbody tr").should(
        "have.length",
        1,
      )
      cy.checkTable(
        "survey-details-table",
        0,
        "eure et loir eligibilite aide menagere personne handicap",
      )
    })
  })

  context("when click on switch view button", () => {
    beforeEach(() => {
      cy.switchView()
    })

    it("displays survey details chart", () => {
      cy.checkGraph("chart-depart1825_montant_maximum", "D. réussie", "213")
      cy.checkGraph(
        "chart-eure_et_loir_eligibilite_aide_menagere_personne_handicap",
        "D. réussie",
        "142",
      )
      cy.checkGraph("chart-gratuite_musees_monuments", "D. réussie", "148")
    })
  })
})
