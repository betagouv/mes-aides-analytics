import { Component } from "react"

const MONTH_INDEX = 0
const DEPCOM_INDEX = 1
const DEPARTMENT_INDEX = 2
const REGION_INDEX = 3
const BIKE_TYPE_INDEX = 4
const COUNT_INDEX = 5

class BikeTypeNumberAndBikeTypeTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bikeData: props.bikeData,
      percentage: this.props.percentage,
    }
  }

  countGroupByBikeTypeNumberAndByBikeType(bikeData, depcom) {
    const categories = []
    const result =  bikeData.filter(data => !depcom || depcom === data[DEPCOM_INDEX]).reduce((accum, data, index) => {
      if (!index || [undefined, "#N/A", ""].includes(data[BIKE_TYPE_INDEX])) {
        return accum
      }
      const bikeTypes = data[BIKE_TYPE_INDEX].split(",")
      const bikeTypeNumber = bikeTypes.length.toString()
      const count = isNaN(data[COUNT_INDEX]) ? 0 : parseInt(data[COUNT_INDEX])

      if (!accum[bikeTypeNumber]) {
        accum[bikeTypeNumber] = {
          total: 0
        }
      }

      accum[bikeTypeNumber].total += count
      bikeTypes.forEach((bikeType) => {
        if (!categories.includes(bikeType)) {
          categories.push(bikeType)
        }
        accum[bikeTypeNumber][bikeType] = (accum[bikeTypeNumber][bikeType] || 0) + count
      })
      return  accum
    }, {})

    // Object.keys((result)).forEach((key) => {
    //   const totalPercentage = 0
    //   categories.forEach((category) => {
    //     result[key][category] = result[key][category] || 0
    //   })
    // })

    return {
      categories,
      result
    }
  }
  render() {
    if (!this.state.bikeData) {
      return <>Chargement...</>
    }
    const countGroupByBikeTypeNumberAndByBikeType = this.countGroupByBikeTypeNumberAndByBikeType(this.state.bikeData)
    return (
        <>
          <h3>{this.state.percentage ? "Pourcentages (en colonne)" : "Brutes"}</h3>
          <table>
            <thead>
            <tr>
              <th>type</th>
              {countGroupByBikeTypeNumberAndByBikeType.categories.map((_, index) => <th>
                Par {index + 1}
              </th>)}
            </tr>
            </thead>
            <tbody>
            {countGroupByBikeTypeNumberAndByBikeType.categories.map((category) => (<tr>
              <td>{category}</td>
              {countGroupByBikeTypeNumberAndByBikeType.categories.map((_, index) => (
                  <td>
                    {this.state.percentage ? <>
                      {((countGroupByBikeTypeNumberAndByBikeType.result[index + 1]?.[category] || 0) / countGroupByBikeTypeNumberAndByBikeType.result[index + 1]?.total * 100).toFixed(5) }&nbsp;%
                    </> : <>
                      {countGroupByBikeTypeNumberAndByBikeType.result[index + 1]?.[category] || 0}
                    </>}
                  </td>
                  )
              )}
            </tr>)
            )}
            {/*{this.state.percentage && <tr>*/}
            {/*  <td>Total</td>*/}
            {/*  {{countGroupByBikeTypeNumberAndByBikeType.categories.map((_, index) => (<td>*/}
            {/*        {countGroupByBikeTypeNumberAndByBikeType.categories.map((category) => (*/}
            {/*                    {((countGroupByBikeTypeNumberAndByBikeType.result[index + 1]?.[category] || 0) / countGroupByBikeTypeNumberAndByBikeType.result[index + 1]?.total * 100).toFixed(5) }&nbsp;%*/}
            {/*        )}*/}
            {/*      </td>)*/}
            {/*  )}*/}
            {/*</tr>}*/}
            </tbody>
          </table>
        </>
    )
  }
}

export default BikeTypeNumberAndBikeTypeTable