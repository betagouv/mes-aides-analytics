import { Component } from "react"

import Fetch from "../services/fetch.js"
import BikeTypeNumberTable from "../components/bikeTypeNumberTable"
import BikeTypeNumberAndBikeTypeTable from "../components/bikeTypeNumberAndBikeTypeTable"

class BikeData extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bikeData: [],
      depcom: "",
      timeout: null,
    }
  }

  componentDidMount() {
    const vm = this
    Fetch.getCsvData(process.env._interetsAidesVeloCsvUrl, (bikeData) => {
      vm.setState({ bikeData: bikeData.data })
    })
  }

  onInput(depcom) {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout)
    }
    const vm = this
    const timeout = setTimeout(() => {
      vm.setState({ depcom })
    }, 500)
    this.setState({ timeout })
  }

  render() {
    return (
      <>
        {this.state.bikeData.length && (
          <>
            <h1>Statistiques d'aides aux vélos</h1>

            <div className="flex-justify">
              <div className="flex-bottom flex-gap">
                <label>
                  <span>Filtrer par code insee commune</span>
                  <br />
                  <input
                    type="text"
                    autoComplete="off"
                    value={this.state.depcom}
                    onInput={(e) => this.onInput(e.target.value)}
                  />
                </label>

                {this.state.depcom && (
                  <input
                    type="reset"
                    onClick={() => this.setState({ depcom: "" })}
                  />
                )}
              </div>
            </div>

            <BikeTypeNumberTable
              bikeData={this.state.bikeData}
              depcom={this.state.depcom}
            />

            <h2>Détails des types sélectionnées</h2>
            <BikeTypeNumberAndBikeTypeTable
              bikeData={this.state.bikeData}
              depcom={this.state.depcom}
            />
            <BikeTypeNumberAndBikeTypeTable
              bikeData={this.state.bikeData}
              percentage={true}
              depcom={this.state.depcom}
            />
          </>
        )}
      </>
    )
  }
}

export default BikeData
