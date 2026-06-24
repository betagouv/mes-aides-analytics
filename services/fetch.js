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

  static async getUsageSeries() {
    const [globalOldStats, globalNewStats] = await Promise.all([
      this.getJSON(process.env.usageStatisticsOldURL),
      this.getJSON(process.env.usageStatisticsURL),
    ])
    const globalStats = { ...globalOldStats, ...globalNewStats }

    return Object.keys(globalStats)
      .sort()
      .map((monthKey) => {
        return {
          month: monthKey,
          visites: Number(globalStats[monthKey].nb_visits || 0),
          simulations: Number(globalStats[monthKey].nb_visits_converted || 0),
        }
      })
  }

  static buildUsageKpi(visitData, today = new Date()) {
    const totalVisits = visitData.reduce((sum, month) => sum + month.visites, 0)
    const totalSimulations = visitData.reduce(
      (sum, month) => sum + month.simulations,
      0,
    )

    const previousMonthDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    )
    const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}`
    const previousMonthData = visitData.find(
      (month) => month.month === previousMonthKey,
    )

    const previousMonthLabel = previousMonthDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    })

    return {
      totalSimulations,
      totalVisits,
      previousMonthSimulations: previousMonthData?.simulations || 0,
      previousMonthVisits: previousMonthData?.visites || 0,
      previousMonthLabel,
    }
  }

  static buildBenefitsKpi(benefits) {
    const nationalBenefits = benefits.filter(
      (benefit) => benefit.institution?.type === "national",
    ).length

    return {
      nationalBenefits,
      localBenefitsTotal: benefits.length - nationalBenefits,
    }
  }

  static async getUsageDashboard(today = new Date()) {
    const [visitData, benefits] = await Promise.all([
      this.getUsageSeries(),
      this.getBenefits(),
    ])
    const kpi = {
      ...this.buildUsageKpi(visitData, today),
      ...this.buildBenefitsKpi(benefits),
    }

    return { visitData, kpi }
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
