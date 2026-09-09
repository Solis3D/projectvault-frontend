import { useEffect, useState } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { ImageOff, UserRound } from "lucide-react";
import { useParams } from "react-router-dom";
import API_URL from "../config/api";
import MyFooter from "./MyFooter";
import MyNavbar from "./MyNavbar";
import ProjectCard from "./ProjectCard";

const ArtistProfile = function () {
  const { username } = useParams();

  const [artist, setArtist] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getArtistProfile = async function () {
      try {
        setIsLoading(true);
        setError("");

        const [artistResponse, projectsResponse] = await Promise.all([
          fetch(`${API_URL}/artists/${username}`),
          fetch(`${API_URL}/artists/${username}/projects?page=0&size=12`),
        ]);

        if (artistResponse.status === 404) {
          throw new Error("Artist not found.");
        }

        if (!artistResponse.ok || !projectsResponse.ok) {
          throw new Error("Artist profile temporarily unavailable.");
        }

        const [artistData, projectsData] = await Promise.all([artistResponse.json(), projectsResponse.json()]);

        setArtist(artistData);
        setProjects(projectsData.content);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getArtistProfile();
  }, [username]);

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

              {projects.length === 0 ? (
                <div className="pv-portfolio-empty text-center p-5">
                  <ImageOff size={36} className="mb-3" />
                  <h3 className="mb-2">No public projects yet</h3>
                  <p className="mb-0">This artist has not published any projects</p>
                </div>
              ) : (
                <Row className="g-4">
                  {projects.map((project) => (
                    <Col xs={12} md={6} lg={4} key={project.id}>
                      <ProjectCard project={project} />
                    </Col>
                  ))}
                </Row>
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
