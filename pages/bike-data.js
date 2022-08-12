import { Component } from "react"

import Fetch from "../services/fetch.js"
import BikeTypeNumberTable from "../components/bikeTypeNumberTable"
import BikeTypeNumberAndBikeTypeTable from "../components/bikeTypeNumberAndBikeTypeTable"

class BikeData extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bikeData: [],
    }
  }

  async componentDidMount() {
    const bikeData = await Fetch.getCsvData(
      process.env._interetsAidesVeloCsvUrl
    )

    this.setState({ bikeData: bikeData.data })
  }

  render() {
    return (
      <>
        {this.state.bikeData.length && (
          <>
            <h1>Statistiques d'aides aux vélos</h1>
            <BikeTypeNumberTable bikeData={this.state.bikeData} />
            <h2>Détails des types sélectionnées</h2>
            <BikeTypeNumberAndBikeTypeTable bikeData={this.state.bikeData} />
            <BikeTypeNumberAndBikeTypeTable
              bikeData={this.state.bikeData}
              percentage={true}
            />
          </>
        )}
      </>
    )
  }
}

export default BikeData
