import Link from "next/link"
import { useRouter } from "next/router"

const menu = [
  { url: "/", label: "Statistiques d'usage" },
  { url: "/survey", label: "Résultats de sondage" },
  { url: "/behaviours", label: "Comportements utilisateur" },
  { url: "/pages", label: "Statistiques de visite" },
]

function closeMenu() {
  document.getElementById("menu-checkbox").checked = false
}

const Header = () => {
  const router = useRouter().asPath.split("?")[0]
  return (
    <header>
      <input id="menu-checkbox" type="checkbox" autoComplete="off" />
      <label id="menu-switch" htmlFor="menu-checkbox"></label>
      <nav>
        {menu.map((item) => (
          <Link href={item.url} key={item.url}>
            <span
              className={item.url.indexOf(router) >= 0 ? "active" : ""}
              onClick={() => closeMenu()}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </header>
  )
}

export default Header
