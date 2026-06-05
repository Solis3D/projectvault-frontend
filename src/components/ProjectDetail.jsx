import { ArrowLeft, ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import API_URL from "../config/api";
import ImageLightbox from "./ImageLightbox";
import MyFooter from "./MyFooter";
import MyNavbar from "./MyNavbar";
import TimelapseSlider from "./TimelapseSlider";
import { getYouTubeEmbedUrl } from "../utils/mediaUtils";

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProjectDetail = async function () {
      try {
        setIsLoading(true);
        setError("");

        const [projectResponse, imagesResponse] = await Promise.all([
          fetch(`${API_URL}/projects/${projectId}`),
          fetch(`${API_URL}/projects/${projectId}/images`),
        ]);

        if (!projectResponse.ok || !imagesResponse.ok) {
          throw new Error("Errore nel caricamento del progetto!");
        }

        setProject(await projectResponse.json());
        setProjectImages(await imagesResponse.json());
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getProjectDetail();
  }, [projectId]);

  const mainProjectImage = projectImages.find((image) => image.imageType === "MAIN");
  const fallbackMainImage = project?.thumbnailUrl
    ? {
        id: "thumbnail",
        imageUrl: project.thumbnailUrl,
        caption: "",
        stageLabel: "",
        imageType: "MAIN",
      }
    : null;

  const mainImage = mainProjectImage || fallbackMainImage;
  const galleryImages = projectImages.filter((image) => image.imageType === "GALLERY");
  const timelapseImages = projectImages.filter((image) => image.imageType === "TIMELAPSE");
  const currentStageIndex = project ? PIPELINE_STAGES.indexOf(project.projectStatus) : -1;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(project?.youtubeUrl);

  return (
    <>
      <MyNavbar />

      <section className="pv-project-detail py-5">
        <Container fluid className="pv-detail-container px-4 px-xxl-5 py-md-4">
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
                <Col lg={8} xxl={9}>
                  {mainImage ? (
                    <button type="button" className="pv-image-button" onClick={() => setSelectedImage(mainImage)}>
                      <img src={mainImage.imageUrl} alt={project.title} className="pv-detail-main-image w-100" />
                    </button>
                  ) : (
                    <div className="pv-detail-image-placeholder d-flex align-items-center justify-content-center">
                      <ImageOff size={42} />
                    </div>
                  )}

                  <div className="pv-detail-panel pv-detail-about p-4 mt-4">
                    <h2 className="mb-3">About the Project</h2>
                    <p className="mb-0">{project.description}</p>
                  </div>

                  {youtubeEmbedUrl && (
                    <section className="pv-embed-section mt-5">
                      <div className="mb-3">
                        <p className="pv-label mb-2">Video</p>
                        <h2 className="mb-0">Project Video</h2>
                      </div>

                      <div className="pv-embed-frame">
                        <iframe
                          src={youtubeEmbedUrl}
                          title={`${project.title} video`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </section>
                  )}

                  {galleryImages.length > 0 && (
                    <section className="mt-5">
                      <div className="mb-3">
                        <p className="pv-label mb-2">Gallery</p>
                        <h2 className="mb-0">Project Images</h2>
                      </div>

                      {galleryImages.map((image) => (
                        <div className="pv-detail-gallery-block" key={image.id}>
                          <button type="button" className="pv-image-button" onClick={() => setSelectedImage(image)}>
                            <img src={image.imageUrl} alt={image.caption || image.stageLabel || project.title} className="pv-detail-gallery-large" />
                          </button>

                          {(image.stageLabel || image.caption) && (
                            <div className="pv-detail-image-caption p-3">
                              {image.stageLabel && <p className="pv-label mb-2">{image.stageLabel}</p>}
                              {image.caption && <p className="mb-0">{image.caption}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </section>
                  )}

                  <TimelapseSlider images={timelapseImages} projectTitle={project.title} onImageClick={setSelectedImage} />
                </Col>

                <Col lg={4} xxl={3} className="pv-detail-sidebar">
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

      <ImageLightbox image={selectedImage} title={project?.title} onHide={() => setSelectedImage(null)} />

      <MyFooter />
    </>
  );
};

export default ProjectDetail;
