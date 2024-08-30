const isProduction = "production" === process.env.NODE_ENV

const aidesJeunesUrl = "https://mes-aides.1jeune1solution.beta.gouv.fr/"

const configuration = {
  output: "export",
  assetPrefix: isProduction
    ? "https://betagouv.github.io/mes-aides-analytics/"
    : undefined,
  basePath: isProduction ? "/mes-aides-analytics" : undefined,
  env: {
    // There is and old and a current usage stats URL
    // because of the matomo migration (data.gouv.fr -> stats.data.gouv.fr) in august 2024
    usageStatisticsURL:
      "https://stats.beta.gouv.fr/index.php?date=2024-08-01,yesterday&expanded=1&filter_limit=100&force_api_session=1&format=JSON&format_metrics=1&idSite=63&method=API.get&module=API&period=month&token_auth=anonymous",
    usageStatisticsOldURL:
      "https://stats.data.gouv.fr/index.php?date=2021-01-01,yesterday&expanded=1&filter_limit=100&force_api_session=1&format=JSON&format_metrics=1&idSite=165&method=API.get&module=API&period=month&token_auth=anonymous",
    observatoryURL:
      "https://observatoire.numerique.gouv.fr/Demarches/3135?view-mode=statistics&date-debut=2020-07-01&date-fin=",
    aidesJeunesStatisticsURL:
      "https://mes-aides.1jeune1solution.beta.gouv.fr/documents/stats.json",
    benefitsURL: `${aidesJeunesUrl}api/benefits`,
    pagesStatsURL:
      "https://stats.data.gouv.fr/index.php?module=API&format=JSON&idSite=165&period=range&method=Actions.getExitPageUrls&expanded=1&date=",
    benefitDetailURL: `${aidesJeunesUrl}aides/`,
    recorderStatisticsURL:
      process.env.RECORDER_STATISTICS_URL ||
      "https://aides-jeunes-stats-recorder.osc-fr1.scalingo.io",
    commitSHA: process.env.GITHUB_SHA || "local",
  },
}
export default configuration
