export default class Url {
  static getParameters(parameters) {
    const urlSearch = new URLSearchParams(document.location.search)
    const output = {}
    for (let key of parameters) {
      output[key] = urlSearch.get(key)
    }
    return output
  }

  static setParameters(parameters) {
    const urlSearch = new URLSearchParams(document.location.search)
    for (let key in parameters) {
      urlSearch.set(key, parameters[key])
    }
    history.replaceState(null, null, "?" + urlSearch.toString())
  }
}
