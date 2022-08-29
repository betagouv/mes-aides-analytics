import { Component } from "react"

import Fetch from "../services/fetch.js"
import BikeTypeNumberTable from "../components/bikeTypeNumberTable"
import BikeTypeNumberAndBikeTypeTable from "../components/bikeTypeNumberAndBikeTypeTable"
import Url from "../services/url"
import BikeDataService from "../services/bikeData"

class BikeData extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bikeData: [],
      depcomInput: "",
      depcom: "",
      timeout: null,
      loading: true,
    }
  }

  componentDidMount() {
    const vm = this
    let depcom = Url.getParameters(["depcom"]).depcom || ""
    depcom = depcom === "*" ? "" : depcom
    Fetch.getCsvData(
      process.env._interetsAidesVeloCsvUrl,
      (bikeData) => {
        vm.setState({
          bikeData: bikeData.data,
          depcom,
          depcomInput: depcom,
          loading: false,
        })
      },
      { header: true, delimiter: ";" }
    )
  }

  onInput(depcom) {
    this.setState({ depcomInput: depcom })
  }

  onReset() {
    this.setState({ depcomInput: "", depcom: "" })
    Url.setParameters({ depcom: "*" })
  }

  searchDepcom(e) {
    e.preventDefault()
    const depcom = this.state.depcomInput
    this.setState({ depcom })
    Url.setParameters({ depcom: depcom ? depcom : "*" })
  }

  render() {
    const bikeData = BikeDataService.filterDepcom(
      this.state.bikeData,
      this.state.depcom
    )
    return (
      <>
        <h1>Statistiques d'aides aux vélos</h1>
        {this.state.loading ? (
          <div>Chargement...</div>
        ) : (
          <>
            <form
              className="flex-justify"
              onSubmit={(e) => this.searchDepcom(e)}
            >
              <div className="flex-bottom flex-gap">
                <label>
                  <span>Filtrer par code insee commune</span>
                  <br />
                  <input
                    type="text"
                    autoComplete="off"
                    pattern="\d{5}"
                    inputMode="numeric"
                    value={this.state.depcomInput}
                    onInput={(e) => this.onInput(e.target.value)}
                  />
                </label>

                <button type="submit">Ok</button>

                {this.state.depcom && (
                  <input type="reset" onClick={() => this.onReset()} />
                )}
              </div>
            </form>

            {bikeData.length ? (
              <>
                <BikeTypeNumberTable bikeData={bikeData} />

                <h2>Détails des types sélectionnées</h2>
                <BikeTypeNumberAndBikeTypeTable bikeData={bikeData} />
                <BikeTypeNumberAndBikeTypeTable
                  bikeData={bikeData}
                  percentage={true}
                />
              </>
            ) : (
              <div className="no-result">
                Pas de résultat pour votre recherche...
              </div>
            )}
          </>
        )}
      </>
    )
  }
}

export default BikeData
