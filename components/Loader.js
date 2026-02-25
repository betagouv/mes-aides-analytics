const Loader = ({ message = "Chargement des données..." }) => (
  <div className="loader-container">
    <div className="loader"></div>
    <p>{message}</p>
  </div>
)

export default Loader
