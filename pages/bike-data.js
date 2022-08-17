import { Component } from "react"

import Fetch from "../services/fetch.js"
import BikeTypeNumberTable from "../components/bikeTypeNumberTable"
import BikeTypeNumberAndBikeTypeTable from "../components/bikeTypeNumberAndBikeTypeTable"
import Url from "../services/url"

class BikeData extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bikeData: [],
      depcomInput: "",
      depcom: "",
      timeout: null,
    }
  }

  componentDidMount() {
    const vm = this
    let depcom = Url.getParameters(["depcom"]).depcom || ""
    depcom = depcom === "*" ? "" : depcom
    Fetch.getCsvData(
      process.env._interetsAidesVeloCsvUrl,
      (bikeData) => {
        vm.setState({ bikeData: bikeData.data, depcom, depcomInput: depcom })
      },
      { header: true, delimiter: ";" }
    )
  }

  onInput(depcom) {
    this.setState({ depcomInput: depcom })
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      this.searchDepcom(e.target.value)
    }
  }

  onReset() {
    this.setState({ depcomInput: "", depcom: "" })
    Url.setParameters({ depcom: "*" })
  }

  searchDepcom(depcom) {
    this.setState({ depcom })
    Url.setParameters({ depcom: depcom ? depcom : "*" })
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
                    value={this.state.depcomInput}
                    onInput={(e) => this.onInput(e.target.value)}
                    onKeyUp={(e) => this.handleKeyDown(e)}
                  />
                </label>

                <button
                  onClick={() => this.searchDepcom(this.state.depcomInput)}
                >
                  Ok
                </button>

                {this.state.depcom && (
                  <input type="reset" onClick={() => this.onReset()} />
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
