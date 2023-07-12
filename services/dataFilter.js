import Url from "./url.js"

const numCompare = (a, b) => {
  a = a ? a : 0
  b = b ? b : 0
  return a - b
}

function get(element, depth) {
  depth = depth.split(".")
  let current = depth[0]
  if (depth.length > 1) {
    return get(element[current], depth.slice(1).join("."))
  } else {
    return element[current]
  }
}

const DEFAULT_FILTER_VALUE = "*"

export default class DataFilter {
  static benefits(
    benefits,
    institutions,
    institution_type = DEFAULT_FILTER_VALUE,
    institution = DEFAULT_FILTER_VALUE,
  ) {
    let filteredInstitutions = []
    if (institution_type == DEFAULT_FILTER_VALUE) {
      filteredInstitutions = Object.values(institutions).reduce((accum, el) => {
        return accum.concat(el)
      }, [])
    } else {
      filteredInstitutions = institutions[institution_type]
    }
    filteredInstitutions = filteredInstitutions.sort((a, b) =>
      a.localeCompare(b, "fi"),
    )

    let filteredBenefits = benefits.filter((benefit) => {
      return (
        (institution_type == DEFAULT_FILTER_VALUE ||
          benefit.type == institution_type) &&
        (institution == DEFAULT_FILTER_VALUE ||
          benefit.institution == institution ||
          (benefit.institutions && benefit.institutions.includes(institution)))
      )
    })

    Url.setParameters({
      institution_type,
      institution,
    })

    return {
      filteredInstitutions: filteredInstitutions,
      filteredBenefits: filteredBenefits,
      currentInstitutionType: institution_type,
      currentInstitution: institution,
    }
  }

  static sort(target, sortingBy, sortAscending, alphabeticals = []) {
    let output = target
    if (alphabeticals.includes(sortingBy)) {
      if (sortAscending) {
        output = target.sort((a, b) =>
          get(a, sortingBy).localeCompare(get(b, sortingBy), "fi"),
        )
      } else {
        output = target.sort((a, b) =>
          get(b, sortingBy).localeCompare(get(a, sortingBy), "fi"),
        )
      }
    } else {
      if (sortAscending) {
        output = target.sort((a, b) =>
          numCompare(get(a, sortingBy), get(b, sortingBy)),
        )
      } else {
        output = target.sort((a, b) =>
          numCompare(get(b, sortingBy), get(a, sortingBy)),
        )
      }
    }
    return output
  }

  static getSortAscending(sortingBy, previousSort, ascending) {
    let sortAscending = false
    if (previousSort == sortingBy) {
      sortAscending = !ascending
    }

    return sortAscending
  }

  static get DEFAULT_FILTER_VALUE() {
    return DEFAULT_FILTER_VALUE
  }
}
