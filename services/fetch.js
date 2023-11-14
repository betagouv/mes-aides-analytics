import { EventTypeCategoryMapping } from "./config.js"

export default class Fetch {
  static async getJSON(url) {
    const data = await fetch(url)
    return await data.json()
  }

  static async getSurveyStatistics() {
    const surveyStatiastics = await this.getJSON(
      process.env.aidesJeunesStatisticsURL,
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
    const recorderStatistics = this.aggregateRelatedEventStatistics(
      await this.getJSON(url),
    )

    return recorderStatistics
  }

  static aggregateRelatedEventStatistics(recorderStatistics) {
    const initializeEventCount = (events, eventType) => {
      events[eventType] = events[eventType] || 0
    }

    const sumRelatedCategoryEvents = (events, relatedCategories) =>
      relatedCategories.reduce((sum, category) => {
        initializeEventCount(events, category)
        return sum + events[category]
      }, 0)

    for (const [eventType, eventCategory] of Object.entries(
      EventTypeCategoryMapping,
    )) {
      if (!eventCategory.relatedCategories) {
        continue
      }

      for (const statistic of recorderStatistics) {
        initializeEventCount(statistic.events, eventType)
        statistic.events[eventType] += sumRelatedCategoryEvents(
          statistic.events,
          eventCategory.relatedCategories,
        )
      }
    }

    return recorderStatistics
  }
}
