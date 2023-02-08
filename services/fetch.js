export default class Fetch {
  static async getJSON(url) {
    const data = await fetch(url)
    return await data.json()
  }

  static async benefits(rad) {
    const json = await this.getJSON(process.env.surveyStatisticsURL)
    const benefitsData = await this.getJSON(process.env.benefitsURL)
    const institutions = {}

    const benefitsList = {}
    benefitsData.map((benefit) => {
      benefitsList[benefit.id] = {
        institution: benefit.institution.label,
        type: benefit.institution.type,
      }
      benefitsList[benefit.slug] = {
        institution: benefit.institution.label,
        type: benefit.institution.type,
      }
      if (!institutions[benefit.institution.type]) {
        institutions[benefit.institution.type] = [benefit.institution.label]
      } else {
        if (
          !institutions[benefit.institution.type].includes(
            benefit.institution.label
          )
        ) {
          institutions[benefit.institution.type].push(benefit.institution.label)
        }
      }
    })
    json.survey.details.map((benefit) => {
      if (benefitsList[benefit.id]) {
        benefit.institution = benefitsList[benefit.id].institution
        benefit.type = benefitsList[benefit.id].type
      }
      return benefit
    })
    return {
      benefits: benefitsData,
      benefitsList: benefitsList,
      institutions: institutions,
      summary: json.survey.summary,
      details: json.survey.details,
    }
  }

  static async fetchCsv(url) {
    const response = await fetch(url)
    let reader = response.body.getReader()
    let decoder = new TextDecoder("utf-8")
    const result = await reader.read()
    return decoder.decode(result.value)
  }

  static parseCsv(csv) {
    const rows = csv.split("\n")
    const headers = rows.shift().split(";")
    const result = []

    for (const row of rows) {
      const rowSplit = row.split(";")
      const rowResult = {}
      for (const index in headers) {
        rowResult[headers[index]] = rowSplit[index]
      }
      result.push(rowResult)
    }
    return result
  }

  static async getCsvData(url) {
    let csvData = await this.fetchCsv(url)
    return this.parseCsv(csvData)
  }
}
