import { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import API_URL from "../config/api";

const PROJECT_STATUSES = ["CONCEPT", "BLOCKOUT", "MODELING", "TEXTURING", "RENDERING", "COMPLETED"];

const getInitialFormData = function (project) {
  return {
    title: project?.title || "",
    description: project?.description || "",
    technicalNotes: project?.technicalNotes || "",
    projectStatus: project?.projectStatus || "CONCEPT",
    categoryId: project?.categoryId || "",
    softwareIds: project?.softwares?.map((software) => software.id) || [],
  };
};

const formatLabel = function (value) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ProjectForm = function ({ project, onHide, onSaved }) {
  const { token } = useAuth();

  const [formData, setFormData] = useState(() => getInitialFormData(project));
  const [categories, setCategories] = useState([]);
  const [softwares, setSoftwares] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(project);

  useEffect(() => {
    const getOptions = async function () {
      try {
        setIsLoadingOptions(true);

        const [categoriesResponse, softwareResponse] = await Promise.all([fetch(`${API_URL}/categories`), fetch(`${API_URL}/softwares`)]);

        if (!categoriesResponse.ok || !softwareResponse.ok) {
          throw new Error("Unable to load project options!");
        }

        const categoriesData = await categoriesResponse.json();
        const softwaresData = await softwareResponse.json();

        setCategories(categoriesData);
        setSoftwares(softwaresData);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    getOptions();
  }, []);

  const handleChange = function (event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSoftwareChange = function (softwareId) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      softwareIds: currentFormData.softwareIds.includes(softwareId)
        ? currentFormData.softwareIds.filter((id) => id !== softwareId)
        : [...currentFormData.softwareIds, softwareId],
    }));
  };

  const handleSubmit = async function (event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const body = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        technicalNotes: formData.technicalNotes.trim() || null,
        projectStatus: formData.projectStatus,
        categoryId: formData.categoryId,
        softwareIds: formData.softwareIds,
      };

      const response = await fetch(isEditing ? `${API_URL}/projects/${project.id}` : `${API_URL}/projects`, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.errors?.join(" ") || errorData.message || "Unable to save project!");
      }

      const savedProject = await response.json();

      onSaved(savedProject);
      onHide();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show onHide={onHide} centered size="lg" contentClassName="pv-project-form-modal">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title>{isEditing ? "Edit Project" : "Create Project"}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <p className="pv-form-error">{error}</p>}

          {isLoadingOptions ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="pv-spinner" />
            </div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="pv-form-label">Title</Form.Label>
                <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} className="pv-form-control rounded-0" required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="pv-form-label">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="pv-form-control rounded-0"
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="pv-form-label">Category</Form.Label>
                    <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange} className="pv-form-select rounded-0" required>
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option value={category.id} key={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="pv-form-label">Pipeline Status</Form.Label>
                    <Form.Select name="projectStatus" value={formData.projectStatus} onChange={handleChange} className="pv-form-select rounded-0">
                      {PROJECT_STATUSES.map((status) => (
                        <option value={status} key={status}>
                          {formatLabel(status)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="pv-form-label">Software Used</Form.Label>

                <div className="pv-software-check-grid">
                  {softwares.map((software) => (
                    <Form.Check
                      type="checkbox"
                      id={`software-${software.id}`}
                      label={software.name}
                      checked={formData.softwareIds.includes(software.id)}
                      onChange={() => handleSoftwareChange(software.id)}
                      className="pv-software-check"
                      key={software.id}
                    />
                  ))}
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Label className="pv-form-label">Technical Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="technicalNotes"
                  value={formData.technicalNotes}
                  onChange={handleChange}
                  className="pv-form-control rounded-0"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" className="pv-btn-secondary rounded-0 px-4 py-2" onClick={onHide}>
            Cancel
          </Button>

          <Button type="submit" className="pv-btn-primary border-0 rounded-0 px-4 py-2" disabled={isLoadingOptions || isSaving}>
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProjectForm;
