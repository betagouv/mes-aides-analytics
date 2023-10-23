import {
  interceptRecorderStatistics,
  interceptBenefits,
} from "../support/utils.js"

describe("Behaviour Page", () => {
  beforeEach(() => {
    const interceptRecorderStatisticsIdentifier = interceptRecorderStatistics()
    const interceptBenefitsIdentifier = interceptBenefits()
    cy.visitFromHome("/behaviours")
    cy.wait(interceptRecorderStatisticsIdentifier)
    cy.wait(interceptBenefitsIdentifier)
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
    cy.checkTable("behaviours-table", 0, "depart1825_montant_maximum")
    cy.checkTable("behaviours-table", 0, "808")
    cy.checkTable("behaviours-table", 0, "23")
  })

  context("when select a geographic area", () => {
    beforeEach(() => {
      cy.selectInstitutionType("departement")
    })

    it("filters rows", () => {
      cy.get("[data-testid=behaviours-table] tbody tr").should("have.length", 1)
      cy.checkTable(
        "behaviours-table",
        0,
        "eure_et_loir_eligibilite_aide_menagere_personne_handicap",
      )
    })
  })
})
