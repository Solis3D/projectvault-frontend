import { ArrowLeft, ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import API_URL from "../config/api";
import MyFooter from "./MyFooter";
import MyNavbar from "./MyNavbar";

const PIPELINE_STAGES = ["CONCEPT", "BLOCKOUT", "MODELING", "TEXTURING", "RENDERING", "COMPLETED"];

const formatLabel = function (value) {
  if (!value) return "";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = function (value) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

const ProjectDetail = function () {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [projectImages, setProjectImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProjectDetail = async function () {
      try {
        setIsLoading(true);
        setError("");

        const projectResponse = await fetch(`${API_URL}/projects/${projectId}`);

        if (!projectResponse.ok) {
          throw new Error("Errore nel caricamento del progetto!");
        }

        const projectData = await projectResponse.json();

        const imagesResponse = await fetch(`${API_URL}/projects/${projectId}/images`);

        if (!imagesResponse.ok) {
          throw new Error("Errore nel caricamento delle immagini del progetto!");
        }

        const imagesData = await imagesResponse.json();

        setProject(projectData);
        setProjectImages(imagesData);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getProjectDetail();
  }, [projectId]);

  const mainImage = projectImages.find((image) => image.imageType === "MAIN")?.imageUrl || project?.thumbnailUrl;
  const galleryImages = projectImages.filter((image) => image.imageType !== "MAIN");
  const currentStageIndex = project ? PIPELINE_STAGES.indexOf(project.projectStatus) : -1;

  return (
    <>
      <MyNavbar />

      <section className="pv-project-detail py-5">
        <Container className="py-md-4">
          <Link to="/gallery" className="pv-back-link d-inline-flex align-items-center gap-2 mb-4">
            <ArrowLeft size={18} />
            Back to Gallery
          </Link>

          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" className="pv-spinner" />
            </div>
          )}

          {!isLoading && error && <p className="text-center py-5 mb-0">Project temporarily unavailable.</p>}

          {!isLoading && !error && project && (
            <>
              <div className="mb-4">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="pv-project-tag">{project.categoryName}</span>
                  <span className="pv-project-status">{formatLabel(project.projectStatus)}</span>
                </div>

                <h1 className="pv-detail-title mb-3">{project.title}</h1>

                <p className="pv-detail-meta mb-0">by {project.ownerUsername}</p>
              </div>

              <Row className="g-4 align-items-start">
                <Col lg={8}>
                  {mainImage ? (
                    <img src={mainImage} alt={project.title} className="pv-detail-main-image w-100" />
                  ) : (
                    <div className="pv-detail-image-placeholder d-flex align-items-center justify-content-center">
                      <ImageOff size={42} />
                    </div>
                  )}

                  {galleryImages.length > 0 && (
                    <Row className="g-3 mt-3">
                      {galleryImages.map((image) => (
                        <Col xs={12} md={4} key={image.id}>
                          <div className="pv-detail-gallery-item position-relative">
                            <img src={image.imageUrl} alt={image.caption || project.title} className="pv-detail-gallery-image w-100" />

                            {image.stageLabel && <span className="pv-detail-image-label">{image.stageLabel}</span>}
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}

                  <div className="pv-detail-panel pv-detail-about p-4 mt-4">
                    <h2 className="mb-3">About the Project</h2>
                    <p className="mb-0">{project.description}</p>
                  </div>
                </Col>

                <Col lg={4}>
                  <div className="pv-detail-panel p-4 mb-4">
                    <p className="pv-panel-label mb-3">Pipeline Status</p>

                    <div className="pv-pipeline-steps d-flex flex-wrap gap-2">
                      {PIPELINE_STAGES.map((stage, index) => (
                        <span
                          key={stage}
                          className={
                            stage === project.projectStatus
                              ? "pv-pipeline-step active"
                              : index < currentStageIndex
                                ? "pv-pipeline-step completed"
                                : "pv-pipeline-step"
                          }
                        >
                          {formatLabel(stage)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pv-detail-panel p-4 mb-4">
                    <p className="pv-panel-label mb-3">Software Used</p>

                    {project.softwares.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {project.softwares.map((software) => (
                          <span className="pv-software-pill" key={software.id}>
                            {software.iconUrl ? <img src={software.iconUrl} alt="" className="pv-software-icon" /> : <span className="pv-software-dot"></span>}
                            {software.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mb-0">No software listed.</p>
                    )}
                  </div>

                  <div className="pv-detail-panel p-4 mb-4">
                    <p className="pv-panel-label mb-3">Information</p>

                    <div className="pv-detail-info-row">
                      <span>Category</span>
                      <strong>{project.categoryName}</strong>
                    </div>

                    <div className="pv-detail-info-row">
                      <span>Artist</span>
                      <strong>{project.ownerUsername}</strong>
                    </div>

                    <div className="pv-detail-info-row">
                      <span>Created</span>
                      <strong>{formatDate(project.createdAt)}</strong>
                    </div>

                    <div className="pv-detail-info-row">
                      <span>Last Update</span>
                      <strong>{formatDate(project.updatedAt || project.createdAt)}</strong>
                    </div>
                  </div>

                  {project.technicalNotes && (
                    <div className="pv-detail-panel p-4">
                      <p className="pv-panel-label mb-3">Technical Notes</p>
                      <p className="pv-technical-notes mb-0">{project.technicalNotes}</p>
                    </div>
                  )}
                </Col>
              </Row>
            </>
          )}
        </Container>
      </section>

      <MyFooter />
    </>
  );
};

export default ProjectDetail;
