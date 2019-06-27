import {useState, useCallback, useEffect} from 'react'
import {categoricalColorSchemes} from '@nivo/colors'
import fetch from 'isomorphic-unfetch'
import { scaleOrdinal } from 'd3-scale'
import { ResponsiveBar } from '@nivo/bar'
import 'iframe-resizer'

const catMapping = {
    show: { cat: 'Affiché' },
    click: { cat: 'Cliqué' },
    form: { cat: 'Actionné', name: 'Formulaire' },
    teleservice: { cat: 'Actionné', name: 'Téléservice' },
    instructions: { cat: 'Actionné', name: 'Instructions' },
    link: { cat: 'Actionné', name: 'Lien' },
    msa: { cat: 'Actionné', name: 'MSA' },
    'show-unexpected': { cat: 'Incompris'},
    close: { cat: 'Expliqué', name: 'Fermé'},
    'retour-logement':  {cat: 'Expliqué', name: 'Retour page logement'},
    'simulation-caf':  {cat: 'Expliqué', name: 'Simulateur CAF'},
    email: { cat: 'Expliqué', name: 'Email'},
}

const cats = [
    'Affiché',
    'Cliqué',
    'Actionné',
    'Incompris',
    'Expliqué'
]
const colors = scaleOrdinal(categoricalColorSchemes.category10)

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

    return Object.values(result)
}

const sources = {
//    nb_uniq_visitors: 'Visiteur unique', // Non fonctionnel avec les données mensuelles
    nb_visits: 'Visite',
    nb_events: 'Évènement'
}

const periods = {
    day: 'Hier',
    month: 'Mois en cours'
}

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const MyResponsiveBar = ({ data /* see data tab */ }) => (
    <ResponsiveBar
        data={data}
        keys={Object.keys(catMapping)}
        indexBy="category"
        margin={{ top: 15, right: 10, bottom: 50, left: 60 }}
        padding={0.3}
        colors={({ id }) => colors(id)}
        borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
        animate={false}
    />
)

function Home() {
    const [benefits, setBenefits] = useState([]);
    const [period, setPeriod] = useState('day');
    const [source, setSource] = useState('nb_visits');
    const [show, setShow] = useState(cats.reduce((accum, c) => {
        accum[c] = true
        return accum
    }, {}))

    async function fetchData(period) {
        try {
            const res = await fetch(`https://stats.data.gouv.fr/index.php?date=yesterday&expanded=1&filter_limit=50&format=JSON&idSite=9&method=Events.getName&module=API&period=${period}`)
            const json = await res.json()
            setBenefits(json)
        } catch {
            setBenefits([])
        }
    }

    useEffect(() => {
      fetchData(period)
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
            .chart {
                height: 300px;
            }
            .list {
                display: flex;
                flex-wrap: wrap;
            }
            .cell {
                width: 300px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            h3 {
                margin: 0;
            }
          `}</style>
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
                                            return <div key={catId}><span style={{color:colors(catId)}}>◼</span>&nbsp;{catMapping[catId].name || catMapping[catId].cat}</div>
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
            let l = b.label
            let data = apply(source, b, show)

            if (!data.length) {
                return
            }

            return (
                <div key={l} className="cell">
                    <h3>{l}</h3>
                    <div className="chart">
                        <MyResponsiveBar data={data} />
                    </div>
                </div>
            )
          })}
          </div>
        </div>
    );
}

export default Home;
