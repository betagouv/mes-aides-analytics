import { Component } from "react"

const MONTH_INDEX = 0
const DEPCOM_INDEX = 1
const DEPARTMENT_INDEX = 2
const REGION_INDEX = 3
const BIKE_TYPE_INDEX = 4
const COUNT_INDEX = 5

class BikeTypeNumberTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bikeData: props.bikeData,
    }
  }

  getBikeTypeNumber(bikeType) {
    return [undefined, "#N/A"].includes(bikeType)
      ? 0
      : bikeType.split(",").length
  }

  countGroupByBikeTypeNumber(bikeData, depcom) {
    let total = 0
    const result = bikeData
      .filter((data) => !depcom || depcom === data[DEPCOM_INDEX])
      .reduce((accum, data, index) => {
        if (!index) {
          return accum
        }
        const bikeTypeNumber = this.getBikeTypeNumber(
          data[BIKE_TYPE_INDEX]
        ).toString()
        if (!accum[bikeTypeNumber]) {
          accum[bikeTypeNumber] = {
            count: 0,
          }
        }
        const count = isNaN(data[COUNT_INDEX]) ? 0 : parseInt(data[COUNT_INDEX])
        accum[bikeTypeNumber].count += count
        total += count
        return accum
      }, {})

    Object.keys(result).forEach((bikeTypeNumber) => {
      result[bikeTypeNumber].percentage = (
        (result[bikeTypeNumber].count / total) *
        100
      ).toFixed(5)
    })

    return {
      total,
      result,
    }
  }
  render() {
    if (!this.state.bikeData) {
      return <>Chargement...</>
    }
    const countByBikeTypeNumber = this.countGroupByBikeTypeNumber(
      this.state.bikeData
    )
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
            {Object.entries(countByBikeTypeNumber.result).map(
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
