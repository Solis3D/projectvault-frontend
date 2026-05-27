import { ArrowRight, ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import API_URL from "../config/api";

const FeaturedProjects = function () {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getFeaturedProjects = async function () {
      try {
        const response = await fetch(`${API_URL}/projects/featured?page=0&size=3`);

        if (!response.ok) {
          throw new Error("Errore nel caricamento dei progetti featured!");
        }

        const data = await response.json();
        setFeaturedProjects(data.content);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getFeaturedProjects();
  }, []);

  return (
    <section className="pv-featured py-5">
      <Container className=" py-md-4">
        <div className=" d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className=" mb-2">Featured Projects</h2>
            <p className=" mb-0">Selected works from the ProjectVault gallery</p>
          </div>

          <Link to="/gallery" className="pv-featured-link d-none d-sm-flex align-items-center gap-2">
            View All <ArrowRight size={17} />
          </Link>
        </div>

        {isLoading && (
          <div className=" text-center py-5">
            <Spinner animation="border" className="pv-spinner" />
          </div>
        )}

        {!isLoading && error && <p className=" text-center py-5 mb-0">Featured projects are temporarily unavailable!</p>}

        {!isLoading && !error && featuredProjects.length === 0 && (
          <div className="pv-featured-empty text-center py-5">
            <ImageOff size={32} className="mb-3" />
            <p className="mb-0">No featured projects available yet</p>
          </div>
        )}

        {!isLoading && !error && featuredProjects.length > 0 && (
          <Row className="g-4">
            {featuredProjects.map((project) => (
              <Col xs={12} md={4} key={project.id}>
                <Link to={`/projects/${project.id}`} className="pv-project-card d-block h-100">
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={project.title} className="pv-project-card-image w-100" />
                  ) : (
                    <div className="pv-project-card-placeholder d-flex align-items-center justify-content-center">
                      <ImageOff size={32} />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="pv-project-card-title mb-2">{project.title}</h3>

                    <p className="mb-4">by {project.ownerUsername}</p>

                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <span className="pv-project-tag">{project.categoryName}</span>
                      <span className="pv-project-status">{project.projectStatus}</span>
                    </div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default FeaturedProjects;
