const NO_BIKE_VALUES = [undefined, "#N/A", ""]

export default class BikeData {
  static getBikeTypeNumber(bikeType) {
    return NO_BIKE_VALUES.includes(bikeType) ? 0 : bikeType.split(",").length
  }
  static filterDepcom(bikeData, depcom) {
    return bikeData.filter((data) => !depcom || depcom === data.depcom100kp)
  }

  static countGroupByBikeTypeNumber(bikeData, depcom) {
    let total = 0
    const result = BikeData.filterDepcom(bikeData, depcom).reduce(
      (accum, data, index) => {
        if (!index) {
          return accum
        }
        const bikeTypeNumber = this.getBikeTypeNumber(
          data._interetsAidesVelo
        ).toString()
        if (!accum[bikeTypeNumber]) {
          accum[bikeTypeNumber] = {
            count: 0,
          }
        }
        const count = isNaN(parseFloat(data.count)) ? 0 : parseInt(data.count)
        accum[bikeTypeNumber].count += count
        total += count
        return accum
      },
      {}
    )

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

  static countGroupByBikeTypeNumberAndByBikeType(bikeData, depcom) {
    const categories = []
    const result = BikeData.filterDepcom(bikeData, depcom).reduce(
      (accum, data, index) => {
        if (!index || NO_BIKE_VALUES.includes(data._interetsAidesVelo)) {
          return accum
        }
        const bikeTypes = data._interetsAidesVelo.split(",")
        const bikeTypeNumber = bikeTypes.length.toString()
        const count = isNaN(data.count) ? 0 : parseInt(data.count)

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
      },
      {}
    )

    Object.keys(categories).forEach((_, index) => {
      const bikeTypeNumber = index + 1
      if (!result[bikeTypeNumber]) {
        result[bikeTypeNumber] = { total: 0 }
      }
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
}
