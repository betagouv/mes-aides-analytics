import Papaparse from 'papaparse';

export default class Fetch {
  static getJSON = async (url) => {
    const data = await fetch(url)
    return await data.json()
  }

  static benefits = async (rad) => {
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

  static fetchCsv(url) {
    return fetch(url).then(function (response) {
      let reader = response.body.getReader();
      let decoder = new TextDecoder('utf-8');

      return reader.read().then(function (result) {
        return decoder.decode(result.value);
      });
    });
  }

   static async getCsvData(url) {
    let csvData = await this.fetchCsv(url);

    return Papaparse.parse(csvData, {delimiter: ";"});
  }
}
