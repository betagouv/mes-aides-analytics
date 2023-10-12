import { useEffect, useState } from "react"

import TableService from "../services/tableService.js"

const useFetchInstitutionsData = () => {
  const [dataService, setDataService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(process.env.aidesJeunesStatisticsURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        setDataService(new TableService(data.institutions))
        setLoading(false)
      })
      .catch((error) => {
        setError(error)
        setLoading(false)
      })
  }, [])

  return { dataService, loading, error }
}

export default useFetchInstitutionsData
