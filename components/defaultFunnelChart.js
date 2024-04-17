import React from "react"
import dynamic from "next/dynamic"

const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((m) => m.ResponsiveBar),
  { ssr: false },
)

const xAxisKey = "label"

function findKeysFromData(data) {
  return data.reduce((keys, row) => {
    Object.keys(row).forEach((key) => {
      if (key !== xAxisKey && !keys.includes(key)) {
        keys.push(key)
      }
    })
    return keys
  }, [])
}

export const DefaultFunnelChart = ({ data, dataTestid, showLegend }) => {
  const keys = findKeysFromData(data)

  return (
    <div className="responsive-chart" data-testid={dataTestid}>
      <ResponsiveBar
        data={data}
        indexBy={xAxisKey}
        keys={keys}
        legends={
          showLegend
            ? [
                {
                  dataFrom: "keys",
                  anchor: "top-left",
                  direction: "column",
                  itemHeight: 20,
                },
              ]
            : []
        }
        groupMode="grouped"
        margin={{ top: 15, right: 10, bottom: 150, left: 60 }}
        padding={0.1}
        animate={false}
        colors={["#a4c4eb", "#d62728", "#ff7f0e"]}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legendOffset: 32,
        }}
        role="figure"
      />
    </div>
  )
}
