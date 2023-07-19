export default class Fetch {
  static async getJSON(url) {
    const data = await fetch(url)
    return await data.json()
  }

  static async getSurveyStatistics() {
    const surveyStatiastics = await this.getJSON(
      process.env.surveyStatisticsURL,
    )
    const { benefitInstitutionMapping, institutions } =
      await this.getBenefitsAndInstitutions()

    surveyStatiastics.survey.details.forEach((benefitDetail) => {
      if (benefitInstitutionMapping[benefitDetail.id]) {
        benefitDetail.institution =
          benefitInstitutionMapping[benefitDetail.id].label
        benefitDetail.type = benefitInstitutionMapping[benefitDetail.id].type
      }
    })

    return {
      summary: surveyStatiastics.survey.summary,
      total: surveyStatiastics.survey.total,
      details: surveyStatiastics.survey.details,
      historical: surveyStatiastics.survey.historical,
      institutions: institutions,
    }
  }

  static async getBenefits() {
    const benefits = await this.getJSON(process.env.benefitsURL)

    return benefits
  }

  static async getBenefitsAndInstitutions() {
    const benefits = await this.getBenefits()
    const institutions = {}
    const benefitInstitutionMapping = {}

    benefits.forEach((benefit) => {
      benefitInstitutionMapping[benefit.id] = benefit.institution

      if (!institutions[benefit.institution.type]) {
        institutions[benefit.institution.type] = [benefit.institution.label]
      } else {
        if (
          !institutions[benefit.institution.type].includes(
            benefit.institution.label,
          )
        ) {
          institutions[benefit.institution.type].push(benefit.institution.label)
        }
      }
    })

    return {
      benefits: benefits,
      benefitInstitutionMapping: benefitInstitutionMapping,
      institutions: institutions,
    }
  }

  static async getRecorderStatistics(startAt) {
    const url = `${process.env.recorderStatisticsURL}/benefits?start_at=${startAt}`
    const recorderStatistics = await this.getJSON(url)

    return recorderStatistics
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
