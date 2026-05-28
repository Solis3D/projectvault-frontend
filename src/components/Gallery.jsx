import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import API_URL from "../config/api";
import MyNavbar from "./MyNavbar";
import MyFooter from "./MyFooter";
import ProjectCard from "./ProjectCard";
import { Search, X } from "lucide-react";

const Gallery = function () {
  const [projects, setProjects] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProjects = async function () {
      try {
        setIsLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: "0",
          size: "12",
        });

        if (submittedSearch.trim()) {
          params.append("title", submittedSearch.trim());
        }

        const response = await fetch(`${API_URL}/projects?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Errore nel caricamento dei progetti!");
        }

        const data = await response.json();
        setProjects(data.content);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getProjects();
  }, [submittedSearch]);

  const handleSearch = function (event) {
    event.preventDefault();
    setSubmittedSearch(searchInput);
  };

  const clearSearch = function () {
    setSearchInput("");
    setSubmittedSearch("");
  };

  return (
    <>
      <MyNavbar />

      <section className="pv-gallery py-5">
        <Container className="py-md-4">
          <div className="mb-5">
            <p className="pv-label mb-2">Public Gallery</p>
            <h1 className="pv-gallery-title mb-3">Explore Projects</h1>
            <p className="pv-gallery-description mb-0">Browse public 3D art projects, pipeline studies and portfolio assets shared by ProjectVault artists</p>

            <Form onSubmit={handleSearch} className="pv-gallery-search mt-4">
              <div className=" d-flex flex-column flex-md-row gap-3">
                <Form.Control
                  type="search"
                  placeholder="Search projects by title..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="pv-form-control rounded-0"
                />

                <Button type="submit" className="pv-btn-primary border-0 rounded-0 px-4">
                  <Search size={18} className=" me-2" />
                </Button>

                {submittedSearch && (
                  <Button type="button" className="pv-btn-secondary rounded-0 px-4" onClick={clearSearch}>
                    <X size={18} className="me-2" /> Clear
                  </Button>
                )}
              </div>
            </Form>
          </div>

          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" className="pv-spinner" />
            </div>
          )}

          {!isLoading && error && <p className="text-center py-5 mb-0">Projects are temporarily unavailable</p>}

          {!isLoading && !error && projects.length === 0 && (
            <p className="text-center py-5 mb-0">{submittedSearch ? `No projects found for "${submittedSearch}".` : "No public projects available yet"}</p>
          )}

          {!isLoading && !error && projects.length > 0 && (
            <Row className="g-4">
              {projects.map((project) => (
                <Col xs={12} md={6} lg={4} key={project.id}>
                  <ProjectCard project={project} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      <MyFooter />
    </>
  );
};

export default Gallery;
