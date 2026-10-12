import { useEffect, useState } from "react";
import { Col, Container, Row, Spinner, Button } from "react-bootstrap";
import { ImageOff, UserRound } from "lucide-react";
import { useParams } from "react-router-dom";
import API_URL from "../config/api";
import MyFooter from "./MyFooter";
import MyNavbar from "./MyNavbar";
import ProjectCard from "./ProjectCard";

const PAGE_SIZE = 12;

const ArtistProfile = function () {
  const { username } = useParams();
  return <ArtistProfileContent key={username} username={username} />;
};

const ArtistProfileContent = function ({ username }) {
  const [artist, setArtist] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const getArtistProfile = async function () {
      try {
        setIsLoading(true);
        setError("");

        const artistResponse = await fetch(`${API_URL}/artists/${username}`, {
          signal: controller.signal,
        });

        if (artistResponse.status === 404) {
          throw new Error("Artist not found.");
        }

        if (!artistResponse.ok) {
          throw new Error("Artist profile temporarily unavailable.");
        }

        const artistData = await artistResponse.json();

        if (controller.signal.aborted) {
          return;
        }

        setArtist(artistData);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    getArtistProfile();

    return () => {
      controller.abort();
    };
  }, [username]);

  useEffect(() => {
    const controller = new AbortController();

    const getArtistProjects = async function () {
      try {
        setIsLoadingProjects(true);
        setProjectsError("");

        const projectsResponse = await fetch(`${API_URL}/artists/${username}/projects?page=${currentPage}&size=${PAGE_SIZE}`, {
          signal: controller.signal,
        });

        if (!projectsResponse.ok) {
          throw new Error("Artist projects temporarily unavailable.");
        }

        const projectsData = await projectsResponse.json();

        if (controller.signal.aborted) {
          return;
        }

        if (currentPage === 0) {
          setProjects(projectsData.content);
        } else {
          setProjects((currentProjects) => [...currentProjects, ...projectsData.content]);
        }

        setIsLastPage(projectsData.last);
      } catch (error) {
        if (!controller.signal.aborted) {
          setProjectsError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProjects(false);
        }
      }
    };

    getArtistProjects();

    return () => {
      controller.abort();
    };
  }, [username, currentPage, retryCount]);

  const loadMoreProjects = function () {
    if (isLoadingProjects || isLastPage || projectsError) {
      return;
    }

    setIsLoadingProjects(true);
    setCurrentPage((previousPage) => previousPage + 1);
  };

  const retryProjects = function () {
    if (isLoadingProjects) {
      return;
    }

    setIsLoadingProjects(true);
    setRetryCount((previousCount) => previousCount + 1);
  };

  return (
    <>
      <MyNavbar />

      <section className="pv-portfolio pv-artist-profile flex-grow-1 py-5">
        <Container className="py-md-4">
          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" className="pv-spinner" />
            </div>
          )}

          {!isLoading && error && (
            <div className="pv-portfolio-empty text-center p-5">
              <UserRound size={38} className="mb-3" />
              <h1 className="mb-2">{error}</h1>
              <p className="mb-0">The artist profile may have been removed or renamed</p>
            </div>
          )}

          {!isLoading && !error && artist && (
            <>
              <div className="pv-portfolio-header p-4 p-md-5 mb-4">
                <Row className="align-items-center g-4">
                  <Col xs="auto">
                    {artist.avatarUrl ? (
                      <img src={artist.avatarUrl} alt={artist.username} className="pv-profile-avatar" />
                    ) : (
                      <div className="pv-profile-avatar-placeholder d-flex align-items-center justify-content-center">
                        <UserRound size={42} />
                      </div>
                    )}
                  </Col>

                  <Col>
                    <p className="pv-label mb-2">Artist Profile</p>

                    <h1 className="mb-2">
                      {artist.firstName} {artist.lastName}
                    </h1>

                    <p className="mb-2">@{artist.username}</p>

                    <p className="mb-0">{artist.position || "Digital Artist"}</p>
                  </Col>
                </Row>
              </div>

              {artist.bio && (
                <div className="pv-portfolio-panel p-4 mb-5">
                  <p className="pv-label mb-2">Bio</p>
                  <p className="mb-0">{artist.bio}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="pv-label mb-2">Projects</p>
                <h2 className="mb-0">Public Projects</h2>
              </div>

              {isLoadingProjects && projects.length === 0 && (
                <div className="text-center py-5">
                  <Spinner animation="border" className="pv-spinner" />
                </div>
              )}

              {!isLoadingProjects && projectsError && (
                <div className="text-center py-4">
                  <p role="alert" className="mb-3">
                    {projectsError}
                  </p>

                  <Button type="button" className="pv-btn-secondary rounded-0 px-4" onClick={retryProjects}>
                    Retry
                  </Button>
                </div>
              )}

              {!isLoadingProjects && !projectsError && projects.length === 0 && (
                <div className="pv-portfolio-empty text-center p-5">
                  <ImageOff size={36} className="mb-3" />
                  <h3 className="mb-2">No public projects yet</h3>
                  <p className="mb-0">This artist has not published any projects</p>
                </div>
              )}

              {projects.length > 0 && (
                <Row className="g-4">
                  {projects.map((project) => (
                    <Col xs={12} md={6} lg={4} key={project.id}>
                      <ProjectCard project={project} />
                    </Col>
                  ))}
                </Row>
              )}
              {projects.length > 0 && !isLastPage && !projectsError && (
                <div className="text-center mt-5">
                  <Button type="button" className="pv-btn-primary border-0 rounded-0 px-5 py-3" onClick={loadMoreProjects} disabled={isLoadingProjects}>
                    {isLoadingProjects ? "Loading..." : "Load More"}
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

export default ArtistProfile;
