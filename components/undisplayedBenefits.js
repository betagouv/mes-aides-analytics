import React from "react"

const UndisplayedBenefits = ({ undisplayedBenefits }) => (
  <>
    <h2>Liste des aides non-affichées durant cette période</h2>
    <ul>
      {undisplayedBenefits.map((benefitName) => (
        <li key={benefitName}>{benefitName}</li>
      ))}
    </ul>
  </>
)

export default UndisplayedBenefits
