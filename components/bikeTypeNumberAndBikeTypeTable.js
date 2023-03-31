import { Component } from "react"
import BikeData from "../services/bikeData.js"

class BikeTypeNumberAndBikeTypeTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      percentage: this.props.percentage,
      countGroupByBikeTypeNumberAndByBikeType: null,
    }
  }

  componentDidMount() {
    const countGroupByBikeTypeNumberAndByBikeType =
      BikeData.countGroupByBikeTypeNumberAndByBikeType(this.props.bikeData)
    this.setState({ countGroupByBikeTypeNumberAndByBikeType })
  }

  getSnapshotBeforeUpdate(prevProps) {
    if (prevProps.bikeData === this.props.bikeData) {
      return null
    }

    const countGroupByBikeTypeNumberAndByBikeType =
      BikeData.countGroupByBikeTypeNumberAndByBikeType(this.props.bikeData)
    this.setState({ countGroupByBikeTypeNumberAndByBikeType })
    return null
  }

  render() {
    if (!this.state.countGroupByBikeTypeNumberAndByBikeType) {
      return <>Chargement...</>
    }
    return (
      <>
        <h3>
          {this.state.percentage ? "Pourcentages (en colonne)" : "Brutes"}
        </h3>
        <table>
          <thead>
            <tr>
              <th>type</th>
              {this.state.countGroupByBikeTypeNumberAndByBikeType.categories.map(
                (_, index) => (
                  <th key={`category_${index}`}>Par {index + 1}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {this.state.countGroupByBikeTypeNumberAndByBikeType.categories.map(
              (category) => (
                <tr key={category}>
                  <td>{category}</td>
                  {this.state.countGroupByBikeTypeNumberAndByBikeType.categories.map(
                    (_, index) => (
                      <td key={`${category}_${index}`}>
                        {this.state.percentage ? (
                          <>
                            {
                              this.state.countGroupByBikeTypeNumberAndByBikeType
                                .result[index + 1][category].percentage
                            }
                            &nbsp;%
                          </>
                        ) : (
                          <>
                            {
                              this.state.countGroupByBikeTypeNumberAndByBikeType
                                .result[index + 1][category].count
                            }
                          </>
                        )}
                      </td>
                    )
                  )}
                </tr>
              )
            )}
            {this.state.percentage && (
              <tr>
                <td>Total</td>
                {this.state.countGroupByBikeTypeNumberAndByBikeType.categories.map(
                  (_, index) => (
                    <td key={index}>
                      {
                        this.state.countGroupByBikeTypeNumberAndByBikeType
                          .result[index + 1].totalPercentage
                      }
                      &nbsp;%
                    </td>
                  )
                )}
              </tr>
            )}
          </tbody>
        </table>
      </>
    )
  }
}

export default BikeTypeNumberAndBikeTypeTable
