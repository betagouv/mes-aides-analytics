import { Component } from "react"

import Fetch from "../services/fetch.js"
import SurveyResults from "../components/surveyResults.js"
import SurveyDetails from "../components/surveyDetails.js"

class Survey extends Component {
  constructor(props) {
    super(props)
    this.state = {
      summary: {},
      survey: {},
      institutions: {},
      total: null,
    }
  }

  async componentDidMount() {
    const { institutions, summary, total, details } =
      await Fetch.getSurveyStatistics()
    this.setState({
      institutions: institutions,
      summary: summary,
      survey: details,
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
