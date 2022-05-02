import {useState, useCallback, useEffect} from 'react'
import {categoricalColorSchemes} from '@nivo/colors'
import fetch from 'isomorphic-unfetch'
import { scaleOrdinal } from 'd3-scale'
import { ResponsiveBar } from '@nivo/bar'
import 'iframe-resizer'


const surveyLabels = {
    asked: {
        legend: "Au moins une prestation de la simulation a fait l'objet d'une demande réussie (c'est à dire que l'usager a été au bout de la démarche)",
        short: 'Demande réussie',
        single: 'D. réussie'
    },
    failed: {
        legend: "Au moins une prestation de la simulation a fait l'objet d'une demande mais l'usager <b>N'A PAS</b> réussi à aller au bout de la démarche",
        short: 'Demande échouée',
        single: 'D. échouée'
    },
    nothing: {
        legend: "Aucune prestation n'a fait l'objet d'une demande alors qu'elles ne sont pas perçues",
        short: 'Aucune demande',
        single: 'Rien fait'
    },
    already: {
        legend:"Toutes les prestations affichées étaient déjà perçues",
        short: 'Déjà perçues',
        single: 'Déjà perçue'
    }
}

const surveyIds = Object.keys(surveyLabels)

const catMapping = {
    show: { cat: 'Affiché' },

    showDetails: { cat: 'Détails affichés' },

    form: { cat: 'Actionné', name: 'Formulaire' },
    instructions: { cat: 'Actionné', name: 'Instructions' },
    link: { cat: 'Actionné', name: 'Lien' },
    msa: { cat: 'Actionné', name: 'MSA' },
    'show-locations': { cat: 'Actionné', name: 'Agence' },
    teleservice: { cat: 'Actionné', name: 'Téléservice' },

    'link-ineligible': { cat: 'Actionné inélig.', name: 'Lien sans éligibilité' },

    'show-unexpected': { cat: 'Incompris'},

    close: { cat: 'Expliqué', name: 'Fermé'},

    'retour-logement':  {cat: 'Expliqué', name: 'Retour page logement'},
    'simulation-caf':  {cat: 'Expliqué', name: 'Simulateur CAF'},
    email: { cat: 'Expliqué', name: 'Email'},
}

const cats = Object.keys(Object.values(catMapping).reduce((c, v) => {
    c[v.cat] = {}
    return c
}, {}))

const actionColors = scaleOrdinal(categoricalColorSchemes.category10)
const surveyColors = scaleOrdinal([
    '#2ca02c',
    '#ff7f0e',
    '#d62728',
    '#7f7f7f',
]).domain(Object.keys(surveyLabels))

function apply(prop, base, shouldShow) {
    let result = base.subtable.reduce((accum, table) => {
        if (!catMapping[table.label]) {
            return accum
        }

        accum[catMapping[table.label].cat] = accum[catMapping[table.label].cat] || {
            category: catMapping[table.label].cat
        }
        accum[catMapping[table.label].cat][table.label] = table[prop]
        return accum
    }, {})

    Object.keys(shouldShow).forEach(k => {
        if (!shouldShow[k]) {
            delete result[k]
        }
    })

    return cats.map(c => result[c]).filter(c => c)
}

const sources = {
//    nb_uniq_visitors: 'Visiteur unique', // Non fonctionnel avec les données mensuelles
    nb_visits: 'Visite',
    nb_events: 'Évènement'
}

const periods = {
    day: 'Hier',
    month: "Mois dernier",
    year: new Date().getFullYear().toString(),
}

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const ActionResponsiveBar = ({ data /* see data tab */ }) => (
    <ResponsiveBar
        data={data}
        keys={Object.keys(catMapping)}
        indexBy="category"
        margin={{ top: 15, right: 10, bottom: 50, left: 60 }}
        padding={0.3}
        colors={({ id }) => actionColors(id)}
        borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
        animate={false}
    />
)

function Home() {
    const [survey, setSurvey] = useState({
        summary: [],
        details: {
            data:[],
            maxPercentage: 100,
        }
    });
    const [benefits, setBenefits] = useState([]);
    const [notDisplayedBenefits, setNotDisplayedBenefits] = useState([]);
    const [showActions, setShowActions] = useState(true);
    const [showSurveyDetails, setShowSurveyDetails] = useState(true);
    const [openfiscaVariables, setOpenfiscaVariables] = useState({});
    const [period, setPeriod] = useState('year');
    const [source, setSource] = useState('nb_visits');
    const [show, setShow] = useState(cats.reduce((accum, c) => {
        accum[c] = true
        return accum
    }, {}))

    async function fetchJson(url) {
        const res = await fetch(url)
        return await res.json()
    }

    function reducePageDataToEventClick(clickEventData, pageData) {
        clickEventData.nb_events += pageData.nb_visits
        clickEventData.nb_visits += pageData.nb_visits
        return clickEventData
    }

    async function fetchBenefitPage(period) {
        const json = await fetchJson(`https://stats.data.gouv.fr/index.php?date=yesterday&expanded=1&filter_limit=-1&format=JSON&idSite=165&method=Actions.getPageUrls&module=API&period=${period}&segment=&token_auth=anonymous`)
        return json.find((obj) => obj.label === "simulation").subtable.find((obj) => obj.label === "resultats").subtable
    }

    async function fetchBenefitNames() {
        const json = await fetchJson("https://mes-aides.1jeune1solution.beta.gouv.fr/api/benefits")
        return json.reduce((accum, aide) => {
            accum[aide.label] = accum[aide.label] || []
            accum[aide.label].push(aide.id)
            return accum
        }, {})
    }

    async function fetchData(period) {
        try {
            const data = await Promise.all([
                fetchJson(`https://stats.data.gouv.fr/index.php?&expanded=1&filter_limit=-1&format=JSON&idSite=165&method=Events.getName&module=API&period=${period}&date=yesterday`),
                fetchBenefitPage(period),
                fetchBenefitNames(),
            ])
            const matomoEvents = data[0]
            const nameMap = data[2]
            const matomoPageVisits = data[1]

            const result = matomoEvents.map(aide => {
                if (!(aide.label in nameMap))
                    return aide

                const showDetails = matomoPageVisits.filter((page) => {
                    const cleanName = page.label.substring(1) // benefit names are prefixed with /
                    return nameMap[aide.label].includes(cleanName)
                }).reduce(reducePageDataToEventClick, {
                    label: "showDetails",
                    nb_events: 0,
                    nb_visits: 0,
                })
                aide.subtable.push(showDetails)
                aide.ids = nameMap[aide.label]
                return aide
            }).filter(r => r.subtable)

            const undisplayedBenefits = Object.keys(nameMap).filter(
                (benefitName) => !result.some((benefit) => benefit.label === benefitName)
            ).map(
                (notDisplayed) => `${notDisplayed} (${nameMap[notDisplayed].join(",")})`
            )

            setNotDisplayedBenefits(undisplayedBenefits)
            setBenefits(result)
        } catch {
            setNotDisplayedBenefits([])
            setBenefits([])
        }
    }

    async function fetchSurveyData(period) {
        try {
            const res = await fetch("https://mes-aides.1jeune1solution.beta.gouv.fr/documents/stats.json")
            const json = await res.json()

            const summary = surveyIds.map(id => {
                return {
                    key: id,
                    category: surveyLabels[id].short,
                    value: json.survey.summary[id]
                }
            })

            const details = json.survey.details.map(d => {
                const data =  surveyIds.map(id => {
                    return {
                        id: d.id,
                        key: id,
                        category: surveyLabels[id].single,
                        value: d[id],
                        percentage: Math.round(d[id]/d.total*1000)/10 || 0
                    };
                });

                return {
                    id: d.id,
                    data: data,
                    total: d.total
                }
            })
            const maxPercentage = Math.min(100, 1.1 *Math.max(...details.map(d => d.total <= 10 ?  0 :  Math.max(...d.data.map(p => p.percentage )))))

            let survey = {
                summary,
                details: {
                    data: details,
                    maxPercentage,
                },
                count: json.survey.summary.total
            }
            setSurvey(survey)
        } catch {
            setBenefits([])
        }
    }

    async function fetchOpenfiscaVariables() {
      setOpenfiscaVariables({})
    }

    useEffect(() => {
      fetchData(period)
      fetchSurveyData()
      fetchOpenfiscaVariables()
    }, [])

    const handlePeriodChange = useCallback(e => {
        setPeriod(e.target.value)
        fetchData(e.target.value)
    })
    const handleSourceChange = useCallback(e => {
        setSource(e.target.value)
    })
    const handleShowChange = useCallback((cat, value) => {
        setShow({...show, [cat]: value})
    })
    return (
        <div>
        <style jsx>{`
            div {
                font-family: sans;
            }

            .chart {
                height: 300px;
            }
            .list {
                display: flex;
                flex-wrap: wrap;
            }

            .doubleCell {
                max-width: 600px;
            }

            .cell {
                width: 345px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            h3 {
                margin: 0;
            }

            h4 small {
                display: block;
            }
          `}</style>
          <h1>Statistiques d'impact et d'aide à l'amélioration du produit Mes Aides</h1>

          <h2>Résultats de sondage 7 jours après les simulations (sur {survey.count} réponses)</h2>

          <h3>Le sondage</h3>
          <p>
            Pour chaque prestation affichée sur la page de résultats, les répondants peuvent choisir parmi la liste de réponses suivantes&nbsp;:
          </p>

          <ul>
            <li>J'en bénéficiais déjà</li>
            <li>J'ai fait une demande</li>
            <li>Je n'ai pas réussi à faire une demande</li>
            <li>Je n'ai rien fait</li>
          </ul>

          <p>
            En cas d'échec (demandé échouée ou aucune action), les répondants ont la possibilité d'ajouter un commentaire.
          </p>

          <h3>Résumé du sondage</h3>
            { survey.summary.map(v => (
                <div key={v.key}><span style={{color:surveyColors(v.category)}}>◼</span>&nbsp;<span dangerouslySetInnerHTML={{ __html: surveyLabels[v.key].legend }}></span></div>
            ))}
          <div className="chart doubleCell">
          <ResponsiveBar
            label={d => `${d.value} (${Math.round(100*d.value / survey.count)}%)` }
            data={survey.summary}
            indexBy="category"
            keys={["value"]}
            isInteractive={false}
            margin={{ top: 15, right: 10, bottom: 50, left: 60 }}
            padding={0.3}
            colors={({data}) => surveyColors(data.category) }
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
            animate={false}
        /></div>
        <h3>Détails des résultats du sondage par prestation <button onClick={() => setShowSurveyDetails(!showSurveyDetails)}>Afficher/Cacher</button></h3>
        { showSurveyDetails && (<div className="list">
            { survey.details.data.map(k => (
                <div className="cell" key={k.id}>
                    <h4>
                        {openfiscaVariables[k.id] && openfiscaVariables[k.id].label || k.id}
                        <small>sur {k.total} réponses</small>
                    </h4>
                    <div className="chart">
                        <ResponsiveBar
                            axisLeft={{
                              format: value =>
                                `${Number(value)} %`,
                            }}
                            label={d => d.data.value }
                            data={k.data}
                            maxValue={survey.details.maxPercentage}
                            indexBy="category"
                            keys={["percentage"]}
                            isInteractive={false}
                            margin={{ top: 15, right: 10, bottom: 50, left: 60 }}
                            padding={0.3}
                            colors={({data}) => surveyColors(data.category) }
                            borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                            animate={false}
                        />
                    </div>
                </div>
            ))}
        </div>)}


                  <h2>Comportements utilisateur sur la page de résultats <button onClick={() => setShowActions(!showActions)}>Afficher/Cacher</button></h2>
            { showActions && (<div>
                <p>
                    Les graphiques suivants représentent les taux de conversion sur la page de présentation de résultats sur le simulateur.
                    Différents évènements sont capturés pour mieux évaluer l'impact du simulateur sur le non-recours aux dispositifs présentés aux usagers.
                </p>
                <div className="list">
                    <div className="cell">
                        <div><label>
                            Période de référence
                            <select onChange={handlePeriodChange} defaultValue={period}>
                            {
                                Object.keys(periods).map(k => {
                                    return <option key={k} value={k}>{periods[k]}</option>
                                })
                            }
                            </select>
                        </label></div>
                        <div><label>
                            Source des données
                            <select onChange={handleSourceChange} defaultValue={source}>
                            {
                                Object.keys(sources).map(k => {
                                    return <option key={k} value={k}>{sources[k]}</option>
                                })
                            }
                            </select>
                        </label></div>
                        <table>
                        <tbody>
                        {
                            cats.map(cat => {
                                return (
                                    <tr key={cat}>
                                        <td>
                                            <label>{show[cat]}<input type="checkbox" checked={show[cat]} onChange={e => handleShowChange(cat, e.target.checked)} />
                                            {cat}</label>
                                        </td>
                                        <td>
                                        {Object.keys(catMapping).map(catId => {
                                            if (catMapping[catId].cat === cat) {
                                                return <div key={catId}><span style={{color:actionColors(catId)}}>◼</span>&nbsp;{catMapping[catId].name || catMapping[catId].cat}</div>
                                            }
                                        })}
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                        </table>
                    </div>
              {benefits.map(b => {
                let data = apply(source, b, show)
                let ids = b.ids && b.ids.join(', ')
                let l = b.label

                if (!data.length) {
                    return
                }

                return (
                    <div key={l} className="cell">
                        <h3>{ids ? <abbr title={ids}>{l}</abbr> : l}</h3>
                        <div className="chart">
                            <ActionResponsiveBar data={data} />
                        </div>
                    </div>
                )
              })}
              </div>
          </div>) }
            <div>
                <h3>Liste des aides non-affichées durant cette période</h3>
                <ul>
                    {notDisplayedBenefits.map((benefitName) => {
                        return <li>{benefitName}</li>
                    })}
                </ul>
            </div>

        </div>
    );
}

export default Home;
