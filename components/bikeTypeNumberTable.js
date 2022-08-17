import { Component } from "react"
import BikeData from "../services/bikeData.js"

class BikeTypeNumberTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bikeData: props.bikeData,
      countGroupByBikeTypeNumber: null,
    }
  }

  componentDidMount() {
    const countGroupByBikeTypeNumber = BikeData.countGroupByBikeTypeNumber(
      this.state.bikeData,
      this.props.depcom
    )
    this.setState({ countGroupByBikeTypeNumber })
  }

  getSnapshotBeforeUpdate(prevProps) {
    if (prevProps.depcom === this.props.depcom) {
      return null
    }

    const countGroupByBikeTypeNumber = BikeData.countGroupByBikeTypeNumber(
      this.state.bikeData,
      this.props.depcom
    )
    this.setState({ countGroupByBikeTypeNumber })
    return null
  }

  componentDidUpdate(prevProps, prevState, snapshot) {}

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
              <th>count</th>
              <th>prop</th>
              <th>prop x zéro</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(this.state.countGroupByBikeTypeNumber.result).map(
              ([bikeTypeNumber, value]) => (
                <tr key={bikeTypeNumber}>
                  <td>{bikeTypeNumber}</td>
                  <td>{value.count}</td>
                  <td>{value.percentage}&nbsp;%</td>
                  <td>?</td>
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
