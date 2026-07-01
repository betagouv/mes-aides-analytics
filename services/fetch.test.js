import test from "node:test"
import assert from "node:assert/strict"

import Fetch from "./fetch.js"

test("buildRegionVisits averages monthly visits across the provided months", () => {
  const monthlyStats = {
    "2025-08": [{ region: "IDF", country: "fr", nb_visits: 1200 }],
    "2025-09": [{ region: "IDF", country: "fr", nb_visits: 1800 }],
    "2025-10": [{ region: "IDF", country: "fr", nb_visits: 2400 }],
  }

  assert.deepEqual(Fetch.buildRegionVisits(monthlyStats), [
    { id: "11", value: 1800 },
  ])
})
