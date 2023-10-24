import React from "react"

const InfoIcon = ({ title, children }) => {
  if (!title) {
    return children
  }

  return (
    <div className="info-icon-container" title={title}>
      {children}
      <span className="info-icon">&nbsp;(?)</span>
    </div>
  )
}

export default InfoIcon
