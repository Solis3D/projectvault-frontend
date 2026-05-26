import MyNavbar from "./MyNavbar";

const Home = function () {
  return (
    <>
      <MyNavbar />
      <div className="pv-page-placeholder">
        <h1>
          Project<span className="pv-accent">Vault</span>
        </h1>
      </div>
    </>
  );
};

export default Home;
