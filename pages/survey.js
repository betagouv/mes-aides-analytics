import { Component } from "react"

import Fetch from "../services/fetch.js"
import SurveyResults from "../components/surveyResults.js"
import SurveyDetails from "../components/surveyDetails.js"
import SurveyHistorical from "../components/surveyHistorical.js"

class Survey extends Component {
  constructor(props) {
    super(props)
    this.state = {
      summary: {},
      survey: {},
      institutions: {},
      historical: {},
      total: null,
    }
  }

  async componentDidMount() {
    const { institutions, summary, total, details, historical } =
      await Fetch.getSurveyStatistics()
    this.setState({
      institutions: institutions,
      summary: summary,
      survey: details,
      historical: historical,
      total: total,
    })
  }

  render() {
    return (
      <>
        {this.state.survey.length && (
          <>
            <SurveyResults
              summary={this.state.summary}
              total={this.state.total}
            />
            <SurveyHistorical historical={this.state.historical} />

            <SurveyDetails
              survey={this.state.survey}
              institutions={this.state.institutions}
            />
          </>
        )}
      </>
    )
  }
}

export default Survey
