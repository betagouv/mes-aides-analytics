Cypress.Commands.add("visitHome", () => {
  cy.visit("http://localhost:3000")
})

Cypress.Commands.add("checkMenu", () => {
  const links = ["/", "/survey", "/behaviours", "/pages", "/bike-data"]

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
