import { defineConfig } from "cypress"
import taskHandler from "./cypress/plugins/index.js"

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      return taskHandler(on)
    },
  },
})
