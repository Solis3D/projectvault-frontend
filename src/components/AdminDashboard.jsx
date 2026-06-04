import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Modal, Row, Spinner } from "react-bootstrap";
import { FolderKanban, Globe2, ImageOff, LockKeyhole, Pencil, Trash2, UsersRound } from "lucide-react";
import API_URL from "../config/api";
import useAuth from "../hooks/useAuth";
import MyFooter from "./MyFooter";
import MyNavbar from "./MyNavbar";

const AdminDashboard = function () {
  const { token } = useAuth();

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [softwares, setSoftwares] = useState([]);

  const [categoryFormData, setCategoryFormData] = useState({ name: "", description: "" });
  const [softwareFormData, setSoftwareFormData] = useState({ name: "", iconUrl: "" });

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingSoftwareId, setEditingSoftwareId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [catalogError, setCatalogError] = useState("");

  const [updatingProjectId, setUpdatingProjectId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [catalogItemToDelete, setCatalogItemToDelete] = useState(null);
  const [deletingCatalogId, setDeletingCatalogId] = useState(null);

  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingSoftware, setIsSavingSoftware] = useState(false);

  useEffect(() => {
    const getAdminData = async function () {
      try {
        setIsLoading(true);
        setError("");

        const [statsResponse, projectsResponse, usersResponse, categoriesResponse, softwaresResponse] = await Promise.all([
          fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/admin/projects?page=0&size=12`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/admin/users?page=0&size=8`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/softwares`),
        ]);

        if (!statsResponse.ok || !projectsResponse.ok || !usersResponse.ok || !categoriesResponse.ok || !softwaresResponse.ok) {
          throw new Error("Unable to load admin dashboard data.");
        }

        const statsData = await statsResponse.json();
        const projectsData = await projectsResponse.json();
        const usersData = await usersResponse.json();
        const categoriesData = await categoriesResponse.json();
        const softwaresData = await softwaresResponse.json();

        setStats(statsData);
        setProjects(projectsData.content);
        setUsers(usersData.content);
        setCategories(categoriesData);
        setSoftwares(softwaresData);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getAdminData();
  }, [token]);

  const handleToggleFeatured = async function (projectId) {
    try {
      setUpdatingProjectId(projectId);
      setActionError("");

      const response = await fetch(`${API_URL}/admin/projects/${projectId}/featured`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unable to update featured status.");
      }

      const updatedProject = await response.json();
      setProjects((currentProjects) => currentProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project)));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const openDeleteProjectModal = function (project) {
    setProjectToDelete(project);
    setActionError("");
  };

  const closeDeleteProjectModal = function () {
    setProjectToDelete(null);
  };

  const confirmProjectDelete = async function () {
    try {
      setUpdatingProjectId(projectToDelete.id);
      setActionError("");

      const response = await fetch(`${API_URL}/admin/projects/${projectToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unable to delete project.");
      }

      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectToDelete.id));
      closeDeleteProjectModal();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const handleCategoryChange = function (event) {
    const { name, value } = event.target;
    setCategoryFormData({ ...categoryFormData, [name]: value });
  };

  const handleSoftwareChange = function (event) {
    const { name, value } = event.target;
    setSoftwareFormData({ ...softwareFormData, [name]: value });
  };

  const startEditingCategory = function (category) {
    setEditingCategoryId(category.id);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
    });
    setCatalogError("");
  };

  const cancelCategoryEdit = function () {
    setEditingCategoryId(null);
    setCategoryFormData({ name: "", description: "" });
    setCatalogError("");
  };

  const startEditingSoftware = function (software) {
    setEditingSoftwareId(software.id);
    setSoftwareFormData({
      name: software.name,
      iconUrl: software.iconUrl || "",
    });
    setCatalogError("");
  };

  const cancelSoftwareEdit = function () {
    setEditingSoftwareId(null);
    setSoftwareFormData({ name: "", iconUrl: "" });
    setCatalogError("");
  };

  const handleCategorySubmit = async function (event) {
    event.preventDefault();

    try {
      setIsSavingCategory(true);
      setCatalogError("");

      const url = editingCategoryId ? `${API_URL}/categories/${editingCategoryId}` : `${API_URL}/categories`;
      const method = editingCategoryId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.join(" ") || errorData.message || "Unable to save category.");
      }

      const savedCategory = await response.json();

      setCategories((currentCategories) => {
        const updatedCategories = editingCategoryId
          ? currentCategories.map((category) => (category.id === savedCategory.id ? savedCategory : category))
          : [...currentCategories, savedCategory];

        return updatedCategories.sort((firstCategory, secondCategory) => firstCategory.name.localeCompare(secondCategory.name));
      });

      setEditingCategoryId(null);
      setCategoryFormData({ name: "", description: "" });
    } catch (error) {
      setCatalogError(error.message);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSoftwareSubmit = async function (event) {
    event.preventDefault();

    try {
      setIsSavingSoftware(true);
      setCatalogError("");

      const url = editingSoftwareId ? `${API_URL}/softwares/${editingSoftwareId}` : `${API_URL}/softwares`;
      const method = editingSoftwareId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(softwareFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.join(" ") || errorData.message || "Unable to save software.");
      }

      const savedSoftware = await response.json();

      setSoftwares((currentSoftwares) => {
        const updatedSoftwares = editingSoftwareId
          ? currentSoftwares.map((software) => (software.id === savedSoftware.id ? savedSoftware : software))
          : [...currentSoftwares, savedSoftware];

        return updatedSoftwares.sort((firstSoftware, secondSoftware) => firstSoftware.name.localeCompare(secondSoftware.name));
      });

      setEditingSoftwareId(null);
      setSoftwareFormData({ name: "", iconUrl: "" });
    } catch (error) {
      setCatalogError(error.message);
    } finally {
      setIsSavingSoftware(false);
    }
  };

  const openDeleteCategoryModal = function (category) {
    setCatalogItemToDelete({ type: "category", item: category });
    setCatalogError("");
  };

  const openDeleteSoftwareModal = function (software) {
    setCatalogItemToDelete({ type: "software", item: software });
    setCatalogError("");
  };

  const closeDeleteCatalogModal = function () {
    setCatalogItemToDelete(null);
    setCatalogError("");
  };

  const confirmCatalogDelete = async function () {
    const endpoint = catalogItemToDelete.type === "category" ? "categories" : "softwares";

    try {
      setDeletingCatalogId(catalogItemToDelete.item.id);
      setCatalogError("");

      const response = await fetch(`${API_URL}/${endpoint}/${catalogItemToDelete.item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Delete blocked.");
      }

      if (catalogItemToDelete.type === "category") {
        setCategories((currentCategories) => currentCategories.filter((category) => category.id !== catalogItemToDelete.item.id));
      } else {
        setSoftwares((currentSoftwares) => currentSoftwares.filter((software) => software.id !== catalogItemToDelete.item.id));
      }

      closeDeleteCatalogModal();
    } catch {
      setCatalogError(`This ${catalogItemToDelete.type} cannot be deleted because it is already used by one or more projects.`);
    } finally {
      setDeletingCatalogId(null);
    }
  };

  return (
    <>
      <MyNavbar />

      <section className="pv-admin py-5">
        <Container className="py-md-4">
          <div className="mb-5">
            <p className="pv-label mb-2">Admin Console</p>
            <h1 className="mb-2">Backoffice</h1>
            <p className="mb-0">Manage users, projects and portfolio content from one protected area</p>
          </div>

          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" className="pv-spinner" />
            </div>
          )}

          {!isLoading && error && <p className="text-center py-5 mb-0">{error}</p>}

          {!isLoading && !error && stats && (
            <>
              <Row className="g-4 mb-5">
                <Col md={6} xl={3}>
                  <div className="pv-admin-stat p-4 h-100">
                    <UsersRound size={28} className="mb-3" />
                    <p className="pv-label mb-2">Total Users</p>
                    <h2 className="mb-0">{stats.usersCount}</h2>
                  </div>
                </Col>

                <Col md={6} xl={3}>
                  <div className="pv-admin-stat p-4 h-100">
                    <FolderKanban size={28} className="mb-3" />
                    <p className="pv-label mb-2">Total Projects</p>
                    <h2 className="mb-0">{stats.projectsCount}</h2>
                  </div>
                </Col>

                <Col md={6} xl={3}>
                  <div className="pv-admin-stat p-4 h-100">
                    <Globe2 size={28} className="mb-3" />
                    <p className="pv-label mb-2">Public Projects</p>
                    <h2 className="mb-0">{stats.publicProjectsCount}</h2>
                  </div>
                </Col>

                <Col md={6} xl={3}>
                  <div className="pv-admin-stat p-4 h-100">
                    <LockKeyhole size={28} className="mb-3" />
                    <p className="pv-label mb-2">Private Projects</p>
                    <h2 className="mb-0">{stats.privateProjectCount}</h2>
                  </div>
                </Col>
              </Row>

              <div className="pv-admin-panel p-4 mb-5">
                <div className="d-flex justify-content-between align-items-end gap-3 mb-4">
                  <div>
                    <p className="pv-label mb-2">Projects</p>
                    <h2 className="mb-0">Latest Projects</h2>
                  </div>
                </div>

                {actionError && <p className="pv-form-error mb-3">{actionError}</p>}

                <div className="pv-admin-table">
                  {projects.map((project) => (
                    <div className="pv-admin-project-row" key={project.id}>
                      {project.thumbnailUrl ? (
                        <img src={project.thumbnailUrl} alt={project.title} className="pv-admin-thumb" />
                      ) : (
                        <div className="pv-admin-thumb-placeholder d-flex align-items-center justify-content-center">
                          <ImageOff size={22} />
                        </div>
                      )}

                      <div>
                        <h3 className="mb-1">{project.title}</h3>
                        <p className="mb-0">by {project.ownerUsername}</p>
                      </div>

                      <span className="pv-project-tag">{project.categoryName}</span>
                      <span className="pv-project-status">{project.projectVisibility}</span>
                      <span className="pv-project-status">{project.projectStatus}</span>

                      <div className="d-flex gap-3 align-items-center justify-content-end">
                        <Form.Check
                          type="switch"
                          id={`featured-${project.id}`}
                          label="Featured"
                          checked={project.featured}
                          onChange={() => handleToggleFeatured(project.id)}
                          disabled={updatingProjectId === project.id}
                          className="pv-admin-featured-switch"
                        />

                        <Button
                          type="button"
                          className="pv-admin-action danger"
                          onClick={() => openDeleteProjectModal(project)}
                          disabled={updatingProjectId === project.id}
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {catalogError && !catalogItemToDelete && <p className="pv-form-error mb-4">{catalogError}</p>}

              <Row className="g-4 mb-5">
                <Col lg={6}>
                  <div className="pv-admin-panel p-4 h-100">
                    <p className="pv-label mb-2">Categories</p>
                    <h2 className="mb-4">Manage Categories</h2>

                    <form onSubmit={handleCategorySubmit} className="pv-admin-catalog-form mb-4">
                      <label className="pv-form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={categoryFormData.name}
                        onChange={handleCategoryChange}
                        className="pv-form-control form-control rounded-0 mb-3"
                        placeholder="Environment"
                        required
                      />

                      <label className="pv-form-label">Description</label>
                      <textarea
                        name="description"
                        value={categoryFormData.description}
                        onChange={handleCategoryChange}
                        className="pv-form-control form-control rounded-0 mb-3"
                        placeholder="3D environments, scenes and level art."
                        rows="3"
                      ></textarea>

                      <div className="d-flex gap-3">
                        <Button type="submit" className="pv-btn-primary border-0 rounded-0 px-4 py-2" disabled={isSavingCategory}>
                          {isSavingCategory ? "Saving..." : editingCategoryId ? "Update Category" : "Create Category"}
                        </Button>

                        {editingCategoryId && (
                          <Button type="button" className="pv-btn-secondary rounded-0 px-4 py-2" onClick={cancelCategoryEdit}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>

                    <div className="pv-admin-catalog-list">
                      {categories.map((category) => (
                        <div className="pv-admin-catalog-item" key={category.id}>
                          <div>
                            <h3 className="mb-1">{category.name}</h3>
                            <p className="mb-0">{category.description || "No description"}</p>
                          </div>

                          <div className="d-flex gap-2 flex-shrink-0">
                            <Button type="button" className="pv-admin-action" onClick={() => startEditingCategory(category)} title="Edit category">
                              <Pencil size={16} />
                            </Button>

                            <Button
                              type="button"
                              className="pv-admin-action danger"
                              onClick={() => openDeleteCategoryModal(category)}
                              disabled={deletingCatalogId === category.id}
                              title="Delete category"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="pv-admin-panel p-4 h-100">
                    <p className="pv-label mb-2">Softwares</p>
                    <h2 className="mb-4">Manage Softwares</h2>

                    <form onSubmit={handleSoftwareSubmit} className="pv-admin-catalog-form mb-4">
                      <label className="pv-form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={softwareFormData.name}
                        onChange={handleSoftwareChange}
                        className="pv-form-control form-control rounded-0 mb-3"
                        placeholder="Blender"
                        required
                      />

                      <label className="pv-form-label">Icon URL</label>
                      <input
                        type="text"
                        name="iconUrl"
                        value={softwareFormData.iconUrl}
                        onChange={handleSoftwareChange}
                        className="pv-form-control form-control rounded-0 mb-3"
                        placeholder="https://..."
                      />

                      <div className="d-flex gap-3">
                        <Button type="submit" className="pv-btn-primary border-0 rounded-0 px-4 py-2" disabled={isSavingSoftware}>
                          {isSavingSoftware ? "Saving..." : editingSoftwareId ? "Update Software" : "Create Software"}
                        </Button>

                        {editingSoftwareId && (
                          <Button type="button" className="pv-btn-secondary rounded-0 px-4 py-2" onClick={cancelSoftwareEdit}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>

                    <div className="pv-admin-catalog-list">
                      {softwares.map((software) => (
                        <div className="pv-admin-catalog-item" key={software.id}>
                          <div className="d-flex align-items-center gap-3">
                            {software.iconUrl ? (
                              <img src={software.iconUrl} alt={software.name} className="pv-admin-software-icon" />
                            ) : (
                              <span className="pv-software-dot"></span>
                            )}

                            <div>
                              <h3 className="mb-1">{software.name}</h3>
                              <p className="mb-0">{software.slug}</p>
                            </div>
                          </div>

                          <div className="d-flex gap-2 flex-shrink-0">
                            <Button type="button" className="pv-admin-action" onClick={() => startEditingSoftware(software)} title="Edit software">
                              <Pencil size={16} />
                            </Button>

                            <Button
                              type="button"
                              className="pv-admin-action danger"
                              onClick={() => openDeleteSoftwareModal(software)}
                              disabled={deletingCatalogId === software.id}
                              title="Delete software"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="pv-admin-panel p-4">
                <p className="pv-label mb-2">Users</p>
                <h2 className="mb-4">Latest Users</h2>

                <Row className="g-3">
                  {users.map((user) => (
                    <Col md={6} xl={4} key={user.id}>
                      <div className="pv-admin-user p-3 h-100">
                        <h3 className="mb-1">{user.username}</h3>
                        <p className="mb-2">{user.email}</p>
                        <span className="pv-project-tag">{user.role}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </>
          )}
        </Container>
      </section>

      {projectToDelete && (
        <Modal show centered onHide={closeDeleteProjectModal} contentClassName="pv-project-form-modal">
          <Modal.Header closeButton closeVariant="white">
            <Modal.Title>Delete Project</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p className="mb-2">Are you sure you want to delete this project?</p>
            <h3 className="mb-3">{projectToDelete.title}</h3>
            <p className="pv-form-error mb-0">This action cannot be undone.</p>
          </Modal.Body>

          <Modal.Footer>
            <Button type="button" className="pv-btn-secondary rounded-0 px-4 py-2" onClick={closeDeleteProjectModal}>
              Cancel
            </Button>

            <Button
              type="button"
              className="pv-btn-danger rounded-0 px-4 py-2"
              onClick={confirmProjectDelete}
              disabled={updatingProjectId === projectToDelete.id}
            >
              {updatingProjectId === projectToDelete.id ? "Deleting..." : "Delete Project"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {catalogItemToDelete && (
        <Modal show centered onHide={closeDeleteCatalogModal} contentClassName="pv-project-form-modal">
          <Modal.Header closeButton closeVariant="white">
            <Modal.Title>Delete {catalogItemToDelete.type === "category" ? "Category" : "Software"}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p className="mb-2">Are you sure you want to delete this {catalogItemToDelete.type}?</p>
            <h3 className="mb-3">{catalogItemToDelete.item.name}</h3>
            <p className="pv-form-error mb-0">This action cannot be undone.</p>

            {catalogError && <p className="pv-form-error mt-3 mb-0">{catalogError}</p>}
          </Modal.Body>

          <Modal.Footer>
            <Button type="button" className="pv-btn-secondary rounded-0 px-4 py-2" onClick={closeDeleteCatalogModal}>
              Cancel
            </Button>

            <Button
              type="button"
              className="pv-btn-danger rounded-0 px-4 py-2"
              onClick={confirmCatalogDelete}
              disabled={deletingCatalogId === catalogItemToDelete.item.id}
            >
              {deletingCatalogId === catalogItemToDelete.item.id ? "Deleting..." : "Delete"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <MyFooter />
    </>
  );
};

export default AdminDashboard;
