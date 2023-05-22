const isProduction = "production" === process.env.NODE_ENV

const aidesJeunesUrl = "https://mes-aides.1jeune1solution.beta.gouv.fr/"

const configuration = {
  output: "export",
  assetPrefix: isProduction
    ? "https://betagouv.github.io/mes-aides-analytics/"
    : undefined,
  basePath: isProduction ? "/mes-aides-analytics" : undefined,
  env: {
    usageStatisticsURL:
      "https://stats.data.gouv.fr/index.php?date=2021-01-01,yesterday&expanded=1&filter_limit=100&force_api_session=1&format=JSON&format_metrics=1&idSite=165&method=API.get&module=API&period=month&token_auth=anonymous",
    observatoryURL:
      "https://observatoire.numerique.gouv.fr/Demarches/3135?view-mode=statistics&date-debut=2020-07-01&date-fin=",
    surveyStatisticsURL:
      "https://mes-aides.1jeune1solution.beta.gouv.fr/documents/stats.json",
    benefitsURL: `${aidesJeunesUrl}api/benefits`,
    pagesStatsURL:
      "https://stats.data.gouv.fr/index.php?module=API&format=JSON&idSite=165&period=range&method=Actions.getExitPageUrls&expanded=1&date=",
    visitorsBehaviour:
      "https://stats.data.gouv.fr/index.php?date=yesterday&expanded=1&filter_limit=-1&format=JSON&idSite=165&method=Actions.getPageUrls&module=API&segment=&token_auth=anonymous&period=",
    matomoEvents:
      "https://stats.data.gouv.fr/index.php?&expanded=1&filter_limit=-1&format=JSON&idSite=165&method=Events.getName&module=API&period=range&date=",
    benefitDetailURL: `${aidesJeunesUrl}aides/`,
    recorderStatisticsURL:
      process.env.RECORDER_STATISTICS_URL ||
      "https://aides-jeunes-stats-recorder.osc-fr1.scalingo.io",
    _interetsAidesVeloCsvUrl: `${aidesJeunesUrl}documents/_interetsAidesVelo.csv`,
    commitSHA: process.env.GITHUB_SHA || "local",
  },
}
export default configuration
