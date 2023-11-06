import { Component } from "react"
import { ResponsiveBar } from "@nivo/bar"

import { Config } from "../services/config.js"

class SurveyHistorical extends Component {
  constructor(props) {
    super(props)
    this.state = {
      historical: props.historical,
      monthsToDisplay: 12,
      orderedData: [],
    }
  }

  async componentDidMount() {
    const historicalData = Object.keys(this.state.historical)
      .sort()
      .slice(-this.state.monthsToDisplay)

    this.setState({
      monthsToDisplay: historicalData.length,
      orderedData: historicalData.map((key) => {
        return {
          month: key,
          ...this.state.historical[key],
        }
      }),
    })
  }

  render() {
    return (
      this.state.historical && (
        <>
          <h2 data-testid="survey-historical-title">
            Données historiques des {this.state.monthsToDisplay} derniers mois
          </h2>
          <div
            data-testid="survey-historical-graph"
            className="responsive-chart"
          >
            <ResponsiveBar
              data={this.state.orderedData}
              indexBy="month"
              margin={{ top: 50, right: 140, bottom: 50, left: 60 }}
              padding={0.3}
              colors={({ id }) => {
                return Config.surveyLabels[id].lightColor
              }}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              keys={Object.keys(Config.surveyLabels)}
              role="application"
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legendOffset: 32,
              }}
              legendLabel={(d) => {
                return Config.surveyLabels[d.id].short
              }}
              legends={[
                {
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 160,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 140,
                  itemHeight: 20,
                  itemDirection: "left-to-right",
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
            />
          </div>
        </>
      )
    )
  }
}

export default SurveyHistorical
