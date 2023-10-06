export default class DataService {
  constructor(data) {
    this.originalData = data
    this.filteredData = [...data]
  }

  filterByKeys(filters) {
    this.filteredData = this.originalData.filter((item) =>
      Object.entries(filters).every(([key, query]) =>
        item[key].toLowerCase().includes(query.toLowerCase()),
      ),
    )
    return this
  }

  sortByKey(key, order = "asc") {
    const newLocal = order === "asc"
    this.filteredData = [
      ...this.filteredData.sort((a, b) =>
        newLocal ? (a[key] > b[key] ? 1 : -1) : a[key] < b[key] ? 1 : -1,
      ),
    ]
    return this
  }

  getUniqueValuesForKey(key) {
    const uniqueValues = new Set(this.originalData.map((item) => item[key]))
    return Array.from(uniqueValues)
  }

  getResult() {
    return this.filteredData
  }
}
