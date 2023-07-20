Cypress.Commands.add("visitHome", () => {
  cy.visit("http://localhost:3000")
})

Cypress.Commands.add("visitFromHome", (path) => {
  cy.visitHome()
  cy.get(`nav > a[href="${path}"]`).click()
})

Cypress.Commands.add("checkMenu", () => {
  const links = ["/", "/survey", "/behaviours", "/pages"]

  cy.get("nav").should("be.visible")

  links.forEach((link, index) => {
    cy.get(`nav > a`).eq(index).should("have.attr", "href").and("include", link)
  })
})

Cypress.Commands.add("checkTitle", () => {
  cy.get('[data-testid="title"]').should("be.visible")
})

Cypress.Commands.add("checkGraph", (graphIdentifier, abscissa, value) => {
  cy.get(`[data-testid="${graphIdentifier}"]`).should("be.visible")
  cy.get(`[data-testid="${graphIdentifier}"] svg text`).contains(abscissa)
  cy.get(`[data-testid="${graphIdentifier}"] svg text`).contains(value)
})

Cypress.Commands.add("checkTable", (tableIdentifier, rowNumber, value) => {
  cy.get(`[data-testid="${tableIdentifier}"]`).should("be.visible")
  cy.get(`[data-testid="${tableIdentifier}"] tbody tr`)
    .eq(rowNumber)
    .contains(value)
})

Cypress.Commands.add("switchView", () => {
  cy.get("[data-testid=switch-view]").click()
})

Cypress.Commands.add("selectInstitutionType", (institutionType) => {
  cy.get('[data-testid="select-institution-type"]').select(institutionType)
})
