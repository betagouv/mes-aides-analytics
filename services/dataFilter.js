import Url from "./url.js"

const numCompare = (a, b) => {
  a = a ? a : 0
  b = b ? b : 0
  return a - b
}

export default class DataFilter {
  static benefits = (
    benefits,
    institutions,
    geographic = "*",
    institution = "*"
  ) => {
    let filteredInstitutions = []
    if (geographic == "*") {
      filteredInstitutions = Object.values(institutions).reduce((accum, el) => {
        return accum.concat(el)
      }, [])
    } else {
      filteredInstitutions = institutions[geographic]
    }
    filteredInstitutions = filteredInstitutions.sort((a, b) =>
      a.localeCompare(b, "fi")
    )

    let filteredBenefits = benefits.filter((benefit) => {
      return (
        (geographic == "*" || benefit.type == geographic) &&
        (institution == "*" || benefit.institution == institution)
      )
    })

    Url.setParameters({
      geographic: geographic,
      institution: institution,
    })
    return {
      filteredInstitutions: filteredInstitutions,
      filteredBenefits: filteredBenefits,
      currentInstitutionType: geographic,
      currentInstitution: institution,
    }
  }

  static sort = (
    target,
    sortingBy,
    previousSort,
    ascending,
    alphabeticals = [],
    numericals = []
  ) => {
    let sortAscending = true
    let output = target
    if (previousSort == sortingBy) {
      sortAscending = !ascending
    }
    if (alphabeticals.includes(sortingBy)) {
      if (sortAscending) {
        output = target.sort((a, b) =>
          a[sortingBy].localeCompare(b[sortingBy], "fi")
        )
      } else {
        output = target.sort((a, b) =>
          b[sortingBy].localeCompare(a[sortingBy], "fi")
        )
      }
    } else if (numericals.includes(sortingBy)) {
      if (sortAscending) {
        output = target.sort((a, b) => numCompare(b[sortingBy], a[sortingBy]))
      } else {
        output = target.sort((a, b) => numCompare(a[sortingBy], b[sortingBy]))
      }
    }
    return { output, sortAscending }
  }
}
