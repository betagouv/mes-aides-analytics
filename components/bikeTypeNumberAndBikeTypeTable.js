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
      countGroupByBikeTypeNumberAndByBikeType: null,
    }
  }

  componentDidMount() {
    const countGroupByBikeTypeNumberAndByBikeType =
      this.countGroupByBikeTypeNumberAndByBikeType(
        this.state.bikeData,
        this.props.depcom
      )
    this.setState({ countGroupByBikeTypeNumberAndByBikeType })
  }

  getSnapshotBeforeUpdate(prevProps) {
    if (prevProps.depcom === this.props.depcom) {
      return null
    }

    const countGroupByBikeTypeNumberAndByBikeType =
      this.countGroupByBikeTypeNumberAndByBikeType(
        this.state.bikeData,
        this.props.depcom
      )
    this.setState({ countGroupByBikeTypeNumberAndByBikeType })
    return null
  }

  countGroupByBikeTypeNumberAndByBikeType(bikeData, depcom) {
    const categories = []
    const result = bikeData
      .filter((data) => !depcom || depcom === data[DEPCOM_INDEX])
      .reduce((accum, data, index) => {
        if (!index || [undefined, "#N/A", ""].includes(data[BIKE_TYPE_INDEX])) {
          return accum
        }
        const bikeTypes = data[BIKE_TYPE_INDEX].split(",")
        const bikeTypeNumber = bikeTypes.length.toString()
        const count = isNaN(data[COUNT_INDEX]) ? 0 : parseInt(data[COUNT_INDEX])

        if (!accum[bikeTypeNumber]) {
          accum[bikeTypeNumber] = {
            total: 0,
          }
        }

        accum[bikeTypeNumber].total += count
        bikeTypes.forEach((bikeType) => {
          if (!categories.includes(bikeType)) {
            categories.push(bikeType)
          }
          if (!accum[bikeTypeNumber][bikeType]) {
            accum[bikeTypeNumber][bikeType] = {
              count: 0,
            }
          }
          accum[bikeTypeNumber][bikeType].count += count
        })
        return accum
      }, {})

    Object.keys(result).forEach((bikeTypeNumber) => {
      result[bikeTypeNumber].totalPercentage = 0
      categories.forEach((bikeType) => {
        if (!result[bikeTypeNumber][bikeType]) {
          result[bikeTypeNumber][bikeType] = {
            count: 0,
          }
        }

        const percentage =
          (result[bikeTypeNumber][bikeType].count /
            result[bikeTypeNumber].total) *
          100
        result[bikeTypeNumber][bikeType].percentage = percentage.toFixed(5)
        result[bikeTypeNumber].totalPercentage += percentage
      })
      result[bikeTypeNumber].totalPercentage = Math.round(
        result[bikeTypeNumber].totalPercentage
      )
    })
    return {
      categories,
      result,
    }
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
                                .result[index + 1]?.[category].percentage
                            }
                            &nbsp;%
                          </>
                        ) : (
                          <>
                            {
                              this.state.countGroupByBikeTypeNumberAndByBikeType
                                .result[index + 1]?.[category].count
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
                          .result[index + 1]?.totalPercentage
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
