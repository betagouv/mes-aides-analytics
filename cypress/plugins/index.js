const taskHandler = (on) => {
  on("task", {
    log(message) {
      console.log(message)
      return null
    },

    table(message) {
      console.table(message)
      return null
    },
  })
}

export default taskHandler
