import "iframe-resizer"

import Head from "next/head"
import Header from "../components/header.js"

import { useRouter } from "next/router"

function InIframe() {
  return useRouter().asPath.split("?")[0] == "/iframe"
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>
          Statistiques d'usage du simulateur d'aides 1Jeune1Solution
        </title>
        <link rel="shortcut icon" href="static/favicon.png" as="image" />
        <link rel="stylesheet preload" href="static/style.css" as="style" />
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <meta
          name="description"
          content="Statistiques d'usage du simulateur d'aides sociales de 1Jeune1Solution"
        />
      </Head>
      {!InIframe() && <Header />}
      <main>
        <Component {...pageProps} />
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://github.com/betagouv/mes-aides-analytics/commit/${process.env.commitSHA}`}
          className="commit-sha"
        >
          {process.env.commitSHA}
        </a>
      </main>
    </>
  )
}
