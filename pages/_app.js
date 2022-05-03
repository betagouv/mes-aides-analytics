import "iframe-resizer"

import Head from "next/head"
import Header from "../components/header.js"

import { useRouter } from "next/router"

function inIframe() {
  return useRouter().asPath.split("?")[0] == "/iframe"
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>
          Statistiques d'usage du simulateur d'aides 1Jeune1Solution
        </title>
        <link rel="shortcut icon" href="/static/favicon.png" />
        <link rel="stylesheet preload" href="/static/style.css" />
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <meta
          name="description"
          content="Statistiques d'usage du simulateur d'aides sociales de 1Jeune1Solution"
        />
      </Head>
      {!inIframe() && (
        <Header />
      )}
      <main>
        <Component {...pageProps} />
      </main>
    </>
  )
}
