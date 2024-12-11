import { useState } from "react"

import useFetchInstitutionsData from "../hooks/fetch-institutions-data"
import InfoIcon from "../components/InfoIcon"

const defaultSortOrder = "desc"
const allType = "Tous"

const filterData = (
  dataService,
  queryName,
  queryCode,
  selectedType,
  sortKey,
  sortOrder,
) => {
  let filters = {}

  if (queryName) {
    filters.name = queryName
  }

  if (queryCode) {
    filters.code = queryCode
  }

  if (selectedType && selectedType !== allType) {
    filters.type = selectedType
  }

  let results = dataService.filterByKeys(filters).getResult()

  if (sortKey) {
    results = dataService.sortByKey(sortKey, sortOrder).getResult()
  }

  return results
}

const InstitutionsStats = () => {
  const { dataService, loading, error } = useFetchInstitutionsData()

  const [queryName, setQueryName] = useState("")
  const [queryCode, setQueryCode] = useState("")
  const [selectedType, setSelectedType] = useState(allType)
  const [sortKey, setSortKey] = useState(null)
  const [sortOrder, setSortOrder] = useState(defaultSortOrder)

  let results = []
  if (dataService) {
    results = filterData(
      dataService,
      queryName,
      queryCode,
      selectedType,
      sortKey,
      sortOrder,
    )
  }

  const handleHeaderClick = (newSortKey) => {
    if (newSortKey === sortKey) {
      setSortOrder((prevSortOrder) =>
        prevSortOrder === "asc" ? "desc" : "asc",
      )
    } else {
      setSortKey(newSortKey)
      setSortOrder(defaultSortOrder)
    }
  }

  const getSortOrderClass = (key) => {
    if (key !== sortKey) {
      return
    }

    return sortOrder === "asc" ? "sortable-asc" : "sortable-desc"
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  return (
    <>
      <h1 data-testid="title">
        Statistiques des institutions (EPCI) sur les 12 derniers mois
      </h1>
      <div className="flex-bottom flex-gap">
        <div>
          <label>
            <span>Filtrer par nom</span>
            <input
              type="text"
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              data-testid="filter-name"
            />
          </label>
        </div>
        <div>
          <label>
            <span>Filtrer par code</span>
            <input
              type="text"
              value={queryCode}
              onChange={(e) => setQueryCode(e.target.value)}
              data-testid="filter-code"
            />
          </label>
        </div>
        <div>
          <label>
            <span>Filtrer par type</span>
            <select
              onChange={(e) => setSelectedType(e.target.value)}
              value={selectedType}
              data-testid="filter-type"
            >
              <option value={allType}>{allType}</option>
              {dataService.getUniqueValuesForKey("type").map((k) => {
                return (
                  <option key={k} value={k}>
                    {k}
                  </option>
                )
              })}
            </select>
          </label>
        </div>
      </div>

      <div className="flex-bottom flex-gap flex-justify">
        <table data-testid="institutions-table">
          <thead>
            <tr>
              <th>
                <div>Nom</div>
              </th>
              <th>
                <div>Code</div>
              </th>
              <th>
                <div>Type</div>
              </th>
              <th>
                <div
                  className={`sortable ${getSortOrderClass("population")}`}
                  onClick={() => handleHeaderClick("population")}
                  data-testid="column-population"
                >
                  <InfoIcon title="Données issues d'Étalab - Découpage Administratif">
                    <span>Population</span>
                  </InfoIcon>
                </div>
              </th>
              <th>
                <div
                  className={`sortable ${getSortOrderClass("simulationCount")}`}
                  onClick={() => handleHeaderClick("simulationCount")}
                >
                  <InfoIcon title="Données sur les 6 derniers mois">
                    Nombre de simulation
                  </InfoIcon>
                </div>
              </th>
              <th>
                <div
                  className={`sortable ${getSortOrderClass("benefitCount")}`}
                  onClick={() => handleHeaderClick("benefitCount")}
                >
                  <InfoIcon title="Ratachées directement à l'institution">
                    Nombre d'aides
                  </InfoIcon>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={index}>
                <td className="text-truncate-ellipsis">{row.name}</td>
                <td>{row.code}</td>
                <td>{row.type}</td>
                <td>{row.population}</td>
                <td>{row.simulationCount}</td>
                <td>{row.benefitCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default InstitutionsStats
