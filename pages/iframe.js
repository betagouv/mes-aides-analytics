import { Component } from "react"
import Index from "./index.js"
import Survey from "./survey.js"
import Behaviours from "./behaviours.js"

class Iframe extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <>
        <Index />
        <Survey />
        <Behaviours />
      </>
    )
  }
}

export default Iframe
