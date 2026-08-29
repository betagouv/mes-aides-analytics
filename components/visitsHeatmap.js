import { Component } from "react"
import dynamic from "next/dynamic"

const ResponsiveChoropleth = dynamic(
  () => import("@nivo/geo").then((m) => m.ResponsiveChoropleth),
  { ssr: false },
)

class VisitsHeatmap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      features: [],
    }
  }

  async componentDidMount() {
    const { default: franceRegions } = await import(
      "../services/franceRegions.json"
    )

    this.setState({
      features: franceRegions.features.map((feature) => ({
        ...feature,
        id: feature.properties.code,
      })),
    })
  }

  render() {
    const { data } = this.props
    const { features } = this.state

    if (features.length === 0) {
      return null
    }

    return (
      <>
        <div className="flex-justify map-header">
          <h3>Visites moyennes mensuelles par région sur 12 mois</h3>
        </div>

        <div
          data-testid="region-heatmap"
          className="responsive-chart map-chart"
        >
          {data.length > 0 ? (
            <ResponsiveChoropleth
              data={data}
              features={features}
              domain={[0, Math.max(...data.map((region) => region.value))]}
              label={(feature) => feature.properties?.nom || feature.id}
              tooltip={({ feature }) => (
                <div className="tooltip">
                  <strong>{feature.properties?.nom || feature.id}</strong>
                  <br />
                  Visites : {Math.round(feature.value).toLocaleString("fr-FR")}
                </div>
              )}
              valueFormat={(value) => Math.round(value).toLocaleString("fr-FR")}
              colors="blues"
              unknownColor="#e5e5e5"
              projectionType="mercator"
              projectionScale={1625}
              projectionTranslation={[0.41, 4.227]}
              borderWidth={0.5}
              borderColor="#ffffff"
              legends={[
                {
                  anchor: "bottom-left",
                  direction: "column",
                  translateX: 20,
                  translateY: -70,
                  itemsSpacing: 2,
                  itemWidth: 90,
                  itemHeight: 18,
                  itemDirection: "left-to-right",
                  itemTextColor: "#444444",
                  symbolSize: 18,
                },
              ]}
            />
          ) : (
            <p className="no-result">Aucune donnée de région disponible.</p>
          )}
        </div>
      </>
    )
  }
}

export default VisitsHeatmap
