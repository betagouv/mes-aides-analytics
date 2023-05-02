import { Component } from "react"
import BikeData from "../services/bikeData.js"

class BikeTypeNumberTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      countGroupByBikeTypeNumber: null,
    }
  }

  componentDidMount() {
    const countGroupByBikeTypeNumber = BikeData.countGroupByBikeTypeNumber(
      this.props.bikeData
    )
    this.setState({ countGroupByBikeTypeNumber })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.bikeData === this.props.bikeData) {
      return null
    }
    const countGroupByBikeTypeNumber = BikeData.countGroupByBikeTypeNumber(
      this.props.bikeData
    )
    this.setState({ countGroupByBikeTypeNumber })
    return null
  }

  render() {
    if (!this.state.countGroupByBikeTypeNumber) {
      return <>Chargement...</>
    }
    return (
      <>
        <h2>Nombre de simulations avec n types de vélo sélectionnés</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre de type sélectionnés</th>
              <th>Nombre</th>
              <th>Proportions</th>
              <th>Proportions sans zéro</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(this.state.countGroupByBikeTypeNumber.result).map(
              ([bikeTypeNumber, value]) => (
                <tr key={bikeTypeNumber}>
                  <td>{bikeTypeNumber}</td>
                  <td>{value.count}</td>
                  <td>{value.percentage}&nbsp;%</td>
                  {value.percentageWithoutZero === undefined ? (
                    <td></td>
                  ) : (
                    <td>{value.percentageWithoutZero} %</td>
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </>
    )
  }
}

export default BikeTypeNumberTable
