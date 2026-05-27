import { ArrowRight } from "lucide-react";
import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import heroImage from "../assets/images/hero-vault.png";
import MyNavbar from "./MyNavbar";
import FeaturedProjects from "./FeaturedProjects";
import MyFooter from "./MyFooter";

const Home = function () {
  return (
    <>
      <MyNavbar />

      <section className="pv-hero position-relative overflow-hidden d-flex align-items-center">
        <img src={heroImage} alt="" className="pv-hero-image position-absolute top-0 start-0 w-100 h-100" />

        <div className="pv-hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>

        <Container className="position-relative text-center">
          <div className="pv-hero-content mx-auto">
            <h1 className="pv-hero-title mb-3">
              Project<span className="pv-accent">Vault</span>
            </h1>

            <h2 className="pv-hero-subtitle mb-3">Showcase Your Digital Art Workflow</h2>

            <p className="pv-hero-description mx-auto mb-4">
              Publish your 3D projects, organize your creative process, and build a portfolio that goes beyond the final render
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Button as={Link} to="/gallery" className="pv-btn-primary border-0 rounded-0 px-4 py-3">
                Explore Gallery <ArrowRight size={18} className="ms-2" />
              </Button>

              <Button as={Link} to="/register" className="pv-btn-secondary rounded-0 px-4 py-3">
                Create Your Portfolio
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <FeaturedProjects />

      <MyFooter />
    </>
  );
};

export default Home;
