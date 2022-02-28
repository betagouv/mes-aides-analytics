import { Component } from "react"

import { Config } from "../services/config.js"
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
    }
  }

  async componentDidMount() {
    const { institutions, summary, details } = await Fetch.benefits()
    this.setState({
      institutions: institutions,
      summary: summary,
      survey: details,
    })
  }

  render() {
    return (
      <>
        {this.state.survey.length && (
          <>
            <SurveyResults
              survey={this.state.survey}
              summary={this.state.summary}
              institutions={this.state.institutions}
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
