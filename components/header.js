import Link from "next/link"
import { useRouter } from "next/router"

const menu = [
  { url: "/", label: "Statistiques d'usage" },
  { url: "/survey", label: "Résultats de sondage" },
  { url: "/behaviours", label: "Comportements utilisateur" },
  { url: "/pages", label: "Statistiques de visite" },
]

const Header = () => {
  const router = useRouter().asPath.split("?")[0]
  return (
    <header>
      <nav>
        {menu.map((item) => (
          <Link href={item.url} key={item.url}>
            <a className={router == item.url ? "active" : ""}>{item.label}</a>
          </Link>
        ))}
      </nav>
    </header>
  )
}

export default Header
