import { Component } from "react"
import { ResponsiveBar } from "@nivo/bar"

import { Config } from "../services/config.js"

class SurveyResults extends Component {
  constructor(props) {
    super(props)
    this.state = {
      summary: props.summary,
    }
  }

  render() {
    return (
      <div>
        <h2 data-testid="title">
          Résultats de sondage 7 jours après les simulations (sur{" "}
          {this.state.summary.total} réponses)
        </h2>

        <h3>Le sondage</h3>
        <p>
          Pour chaque prestation affichée sur la page de résultats, les
          répondants peuvent choisir parmi la liste de réponses suivantes :
        </p>

        <ul>
          <li>J'en bénéficiais déjà</li>
          <li>J'ai fait une demande</li>
          <li>Je n'ai pas réussi à faire une demande</li>
          <li>Je n'ai rien fait</li>
        </ul>

        <p>
          En cas d'échec (demandé échouée ou aucune action), les répondants ont
          la possibilité d'ajouter un commentaire.
        </p>

        <h3>Résumé du sondage</h3>
        <div className="flex flex-gap">
          {this.state.summary.total && (
            <div className="responsive-chart" data-testid="survey-summary">
              <ResponsiveBar
                label={(entry) =>
                  `${entry.value} (${Math.round(
                    (100 * entry.value) / this.state.summary.total
                  )}%)`
                }
                data={Object.keys(Config.surveyLabels).map((key) => {
                  return {
                    category: key,
                    legend: Config.surveyLabels[key].short,
                    value: this.state.summary[key],
                  }
                })}
                indexBy="legend"
                keys={["value"]}
                isInteractive={false}
                margin={{ top: 15, right: 10, bottom: 150, left: 60 }}
                padding={0.3}
                colors={({ data }) =>
                  Config.surveyLabels[data.category].lightColor
                }
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legendOffset: 32,
                }}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                animate={false}
              />
            </div>
          )}
          <div className="responsive-chart flex">
            {Object.keys(Config.surveyLabels).map((v) => (
              <div key={v}>
                <span style={{ color: Config.surveyLabels[v].lightColor }}>
                  ◼
                </span>
                &nbsp;
                <span
                  dangerouslySetInnerHTML={{
                    __html: Config.surveyLabels[v].legend,
                  }}
                ></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

export default SurveyResults
