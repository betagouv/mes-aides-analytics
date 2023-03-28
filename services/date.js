export default class DateRange {
  static getPastDate(days) {
    const date = new Date()
    return `${
      new Date(date.setDate(date.getDate() - days)).toISOString().split("T")[0]
    }`
  }

  static getPeriods() {
    return {
      day: { label: "Dernière 24 heures", from: this.getPastDate(1) },
      week: { label: "7 derniers jours", from: this.getPastDate(7) },
      month: { label: "30 derniers jours", from: this.getPastDate(30) },
      year: { label: "365 derniers jours", from: this.getPastDate(365) },
      all: { label: "Toute la donnée", from: "2021-01-01" },
    }
  }
}
