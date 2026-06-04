import { useEffect, useState } from "react";
import { Button, Col, Container, Modal, Row, Spinner } from "react-bootstrap";
import { ArrowLeft, Globe2, ImageOff, LockKeyhole, Pencil, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import API_URL from "../config/api";
import useAuth from "../hooks/useAuth";
import MyFooter from "./MyFooter";
import MyNavbar from "./MyNavbar";
import ProjectForm from "./ProjectForm";
import ProjectImageUpload from "./ProjectImageUpload";
import ProjectEmbedSettings from "./ProjectEmbedSettings";

const ProjectManager = function () {
  const { projectId } = useParams();
  const { token } = useAuth();

  const [project, setProject] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [error, setError] = useState("");
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [visibilityError, setVisibilityError] = useState("");
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [mediaError, setMediaError] = useState("");
  const [imageToDelete, setImageToDelete] = useState(null);

  const mainImages = images.filter((image) => image.imageType === "MAIN");
  const galleryImages = images.filter((image) => image.imageType === "GALLERY");
  const timelapseImages = images.filter((image) => image.imageType === "TIMELAPSE");

  const hasMainImage = mainImages.length > 0;
  const isPublic = project?.projectVisibility === "PUBLIC";

  useEffect(() => {
    const getProjectManagerData = async function () {
      try {
        setIsLoading(true);
        setError("");

        const [projectResponse, imagesResponse] = await Promise.all([
          fetch(`${API_URL}/users/me/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/users/me/projects/${projectId}/images`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!projectResponse.ok || !imagesResponse.ok) {
          throw new Error("Unable to load project management data");
        }

        setProject(await projectResponse.json());
        setImages(await imagesResponse.json());
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getProjectManagerData();
  }, [projectId, token]);

  const handleProjectSaved = function (savedProject) {
    setProject(savedProject);
  };

  const handleImagesUploaded = function (uploadedImages) {
    setImages((currentImages) =>
      [...currentImages, ...uploadedImages].sort((firstImage, secondImage) => (firstImage.sortOrder ?? 0) - (secondImage.sortOrder ?? 0)),
    );
  };

  const handleVisibilityToggle = async function () {
    const nextVisibility = isPublic ? "PRIVATE" : "PUBLIC";

    if (nextVisibility === "PUBLIC" && !hasMainImage) {
      setVisibilityError("Add a main image before publishing your project.");
      return;
    }

    try {
      setIsUpdatingVisibility(true);
      setVisibilityError("");

      const response = await fetch(`${API_URL}/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectVisibility: nextVisibility,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.errors?.join(" ") || errorData.message || "Unable to update project visibility");
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
    } catch (error) {
      setVisibilityError(error.message);
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const openDeleteImageModal = function (image) {
    setImageToDelete(image);
  };

  const closeDeleteImageModal = function () {
    setImageToDelete(null);
  };

  const confirmImageDelete = async function () {
    try {
      setDeletingImageId(imageToDelete.id);
      setMediaError("");

      const deleteResponse = await fetch(`${API_URL}/project-images/${imageToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!deleteResponse.ok) {
        throw new Error("Unable to delete image.");
      }

      setImages((currentImages) => currentImages.filter((image) => image.id !== imageToDelete.id));

      if (imageToDelete.imageType === "MAIN") {
        const projectResponse = await fetch(`${API_URL}/projects/${project.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            thumbnailUrl: "",
            projectVisibility: isPublic ? "PRIVATE" : project.projectVisibility,
          }),
        });

        if (!projectResponse.ok) {
          throw new Error("Image deleted, but project thumbnail could not be updated");
        }

        const updatedProject = await projectResponse.json();
        setProject(updatedProject);
      }

      closeDeleteImageModal();
    } catch (error) {
      setMediaError(error.message);
    } finally {
      setDeletingImageId(null);
    }
  };

  const renderMediaSection = function (title, description, sectionImages) {
    return (
      <div className="pv-media-section mb-4">
        <div className="d-flex justify-content-between align-items-end gap-3 mb-3">
          <div>
            <p className="pv-label mb-2">{title}</p>
            <p className="mb-0">{description}</p>
          </div>

          <span className="pv-project-tag">{sectionImages.length}</span>
        </div>

        {sectionImages.length === 0 ? (
          <div className="pv-media-empty p-4 text-center">
            <ImageOff size={30} className="mb-2" />
            <p className="mb-0">No images added yet.</p>
          </div>
        ) : (
          <Row className="g-3">
            {sectionImages.map((image) => (
              <Col xs={12} md={6} key={image.id}>
                <div className="pv-media-item h-100">
                  <img src={image.imageUrl} alt={image.caption || image.stageLabel || project.title} />

                  <div className="p-3">
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <span className="pv-project-tag">{image.imageType}</span>

                      <Button
                        type="button"
                        className="pv-icon-danger-btn"
                        onClick={() => openDeleteImageModal(image)}
                        disabled={deletingImageId === image.id}
                        title="Delete image"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    {image.stageLabel && <h3 className="mt-3 mb-2">{image.stageLabel}</h3>}
                    {image.caption && <p className="mb-0">{image.caption}</p>}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    );
  };

  return (
    <>
      <MyNavbar />

      <section className="pv-project-manager py-5">
        <Container className="py-md-4">
          <Link to="/portfolio" className="pv-back-link d-inline-flex align-items-center gap-2 mb-4">
            <ArrowLeft size={18} />
            Back to My Portfolio
          </Link>

          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" className="pv-spinner" />
            </div>
          )}

          {!isLoading && error && <p className="text-center py-5 mb-0">Project management is temporarily unavailable.</p>}

          {!isLoading && !error && project && (
            <>
              <div className="pv-portfolio-header p-4 p-md-5 mb-5">
                <Row className="align-items-center g-4">
                  <Col>
                    <p className="pv-label mb-2">Project Manager</p>
                    <h1 className="mb-2">{project.title}</h1>
                    <p className="mb-0">
                      {project.categoryName} | {project.projectStatus} | {project.projectVisibility}
                    </p>
                  </Col>

                  <Col xs={12} md="auto">
                    <div className="d-flex flex-column flex-sm-row gap-3">
                      <Button className="pv-btn-secondary rounded-0 px-4 py-3" onClick={() => setIsEditingDetails(true)}>
                        <Pencil size={18} className="me-2" />
                        Edit Details
                      </Button>

                      <Button
                        className={isPublic ? "pv-btn-secondary rounded-0 px-4 py-3" : "pv-btn-primary border-0 rounded-0 px-4 py-3"}
                        onClick={handleVisibilityToggle}
                        disabled={isUpdatingVisibility}
                      >
                        {isPublic ? <LockKeyhole size={18} className="me-2" /> : <Globe2 size={18} className="me-2" />}

                        {isUpdatingVisibility ? "Updating..." : isPublic ? "Make Private" : "Publish Project"}
                      </Button>
                    </div>

                    {!isPublic && !hasMainImage && <p className="pv-form-error mt-3 mb-0">Add a main image before publishing your project.</p>}

                    {visibilityError && <p className="pv-form-error mt-3 mb-0">{visibilityError}</p>}
                  </Col>
                </Row>
              </div>

              <Row className="g-4">
                <Col lg={8}>
                  <ProjectImageUpload project={project} images={images} onImagesUploaded={handleImagesUploaded} onProjectUpdated={handleProjectSaved} />

                  {mediaError && <p className="pv-form-error">{mediaError}</p>}

                  {renderMediaSection("Main Image", "Primary image used as thumbnail and hero preview", mainImages)}

                  {renderMediaSection("Gallery Images", "Regular portfolio images with optional captions", galleryImages)}

                  {renderMediaSection("Timelapse Sequence", "Ordered workflow frames used for the timelapse slider", timelapseImages)}
                </Col>

                <Col lg={4}>
                  <div className="pv-detail-panel p-4 mb-4">
                    <p className="pv-panel-label mb-3">Project Information</p>
                    <ProjectEmbedSettings project={project} onProjectUpdated={handleProjectSaved} />
                    <p className="mb-2">Category: {project.categoryName}</p>
                    <p className="mb-2">Status: {project.projectStatus}</p>
                    <p className="mb-0">Visibility: {project.projectVisibility}</p>
                  </div>

                  <div className="pv-detail-panel p-4">
                    <p className="pv-panel-label mb-3">Media Summary</p>
                    <p className="mb-2">Main images: {mainImages.length}</p>
                    <p className="mb-2">Gallery images: {galleryImages.length}</p>
                    <p className="mb-0">Timelapse frames: {timelapseImages.length}</p>
                  </div>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </section>

      {isEditingDetails && <ProjectForm project={project} onHide={() => setIsEditingDetails(false)} onSaved={handleProjectSaved} />}

      {imageToDelete && (
        <Modal show centered onHide={closeDeleteImageModal} contentClassName="pv-project-form-modal">
          <Modal.Header closeButton closeVariant="white">
            <Modal.Title>Delete Image</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p className="mb-3">Are you sure you want to delete this image?</p>

            {imageToDelete.imageUrl && (
              <img src={imageToDelete.imageUrl} alt={imageToDelete.caption || imageToDelete.stageLabel || project.title} className="pv-delete-preview w-100" />
            )}

            {imageToDelete.imageType === "MAIN" && (
              <p className="pv-form-error mt-3 mb-0">Deleting the main image will also remove the project thumbnail and make the project private.</p>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button type="button" className="pv-btn-secondary rounded-0 px-4 py-2" onClick={closeDeleteImageModal}>
              Cancel
            </Button>

            <Button type="button" className="pv-btn-danger rounded-0 px-4 py-2" onClick={confirmImageDelete} disabled={deletingImageId === imageToDelete.id}>
              {deletingImageId === imageToDelete.id ? "Deleting..." : "Delete Image"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <MyFooter />
    </>
  );
};

export default ProjectManager;
