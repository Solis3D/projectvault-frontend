import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import API_URL from "../config/api";
import MyFooter from "./MyFooter";
import MyNavbar from "./MyNavbar";
import ProjectCard from "./ProjectCard";

const PAGE_SIZE = 12;

const Gallery = function () {
  const [projects, setProjects] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProjects = async function () {
      try {
        setIsLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: currentPage.toString(),
          size: PAGE_SIZE.toString(),
        });

        if (submittedSearch.trim()) {
          params.append("title", submittedSearch.trim());
        }

        if (selectedCategoryId) {
          params.append("categoryId", selectedCategoryId);
        }

        const response = await fetch(`${API_URL}/projects?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Errore nel caricamento dei progetti!");
        }

        const data = await response.json();

        if (currentPage === 0) {
          setProjects(data.content);
        } else {
          setProjects((currentProjects) => [...currentProjects, ...data.content]);
        }

        setIsLastPage(data.last);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getProjects();
  }, [submittedSearch, selectedCategoryId, currentPage]);

  useEffect(() => {
    const getCategories = async function () {
      try {
        const response = await fetch(`${API_URL}/categories`);

        if (!response.ok) {
          throw new Error("Errore nel caricamento delle categorie!");
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.log(error.message);
      }
    };

    getCategories();
  }, []);

  const handleSearch = function (event) {
    event.preventDefault();

    const trimmedSearch = searchInput.trim();
    if (trimmedSearch === submittedSearch && currentPage === 0) {
      return;
    }

    setProjects([]);
    setCurrentPage(0);
    setSubmittedSearch(trimmedSearch);
  };

  const clearSearch = function () {
    if (!searchInput && !submittedSearch && currentPage === 0) {
      return;
    }
    setSearchInput("");
    setProjects([]);
    setCurrentPage(0);
    setSubmittedSearch("");
  };

  const handleCategoryChange = function (categoryId) {
    if (categoryId === selectedCategoryId && currentPage === 0) {
      return;
    }

    setProjects([]);
    setCurrentPage(0);
    setSelectedCategoryId(categoryId);
  };

  const loadMoreProjects = function () {
    setCurrentPage(currentPage + 1);
  };

  const hasActiveFilters = submittedSearch || selectedCategoryId;

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
              <div className="d-flex flex-column flex-md-row gap-3">
                <Form.Control
                  type="search"
                  placeholder="Search projects by title..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="pv-form-control rounded-0"
                />

                <Button type="submit" className="pv-btn-primary border-0 rounded-0 px-4">
                  <Search size={18} className="me-2" />
                  Search
                </Button>

                {submittedSearch && (
                  <Button type="button" className="pv-btn-secondary rounded-0 px-4" onClick={clearSearch}>
                    <X size={18} className="me-2" />
                    Clear
                  </Button>
                )}
              </div>
            </Form>

            <div className="pv-category-filter d-flex flex-wrap gap-2 mt-4">
              <button type="button" className={selectedCategoryId === "" ? "pv-filter-pill active" : "pv-filter-pill"} onClick={() => handleCategoryChange("")}>
                All Projects
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={selectedCategoryId === category.id ? "pv-filter-pill active" : "pv-filter-pill"}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {isLoading && projects.length === 0 && (
            <div className="text-center py-5">
              <Spinner animation="border" className="pv-spinner" />
            </div>
          )}

          {!isLoading && error && projects.length === 0 && <p className="text-center py-5 mb-0">Projects are temporarily unavailable</p>}

          {!isLoading && !error && projects.length === 0 && (
            <p className="text-center py-5 mb-0">{hasActiveFilters ? "No projects match your filters." : "No public projects available yet"}</p>
          )}

          {projects.length > 0 && (
            <>
              <Row className="g-4">
                {projects.map((project) => (
                  <Col xs={12} md={6} lg={4} key={project.id}>
                    <ProjectCard project={project} />
                  </Col>
                ))}
              </Row>

              {!isLastPage && !error && (
                <div className="text-center mt-5">
                  <Button type="button" className="pv-btn-primary border-0 rounded-0 px-5 py-3" onClick={loadMoreProjects} disabled={isLoading}>
                    {isLoading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      <MyFooter />
    </>
  );
};

export default Gallery;
