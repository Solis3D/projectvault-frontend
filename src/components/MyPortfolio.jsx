import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import API_URL from "../config/api";
import { Link, useNavigate } from "react-router-dom";
import MyNavbar from "./MyNavbar";
import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { ImageOff, Plus, UserRound } from "lucide-react";
import MyFooter from "./MyFooter";
import ProjectForm from "./ProjectForm";

const MyPortfolio = function () {
  const navigate = useNavigate();
  const { currentUser, token, updateCurrentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    username: currentUser?.username || "",
    position: currentUser?.position || "",
    bio: currentUser?.bio || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);

  const isProfileIncomplete = !currentUser?.avatarUrl || !currentUser?.position || !currentUser?.bio;

  useEffect(() => {
    const getMyProjects = async function () {
      try {
        setIsLoadingProjects(true);
        setError("");

        const response = await fetch(`${API_URL}/users/me/projects?page=0&size=12`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Errore nel caricamento dei progetti!");
        }

        const data = await response.json();
        setProjects(data.content);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    getMyProjects();
  }, [token]);

  const handleProfileChange = function (event) {
    const { name, value } = event.target;

    setProfileFormData({
      ...profileFormData,
      [name]: value,
    });
  };

  const openProfileEditor = function () {
    setProfileFormData({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      username: currentUser?.username || "",
      position: currentUser?.position || "",
      bio: currentUser?.bio || "",
    });

    setProfileError("");
    setProfileSuccess("");
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarError("");
    setAvatarSuccess("");
    setIsEditingProfile(true);
  };

  const closeProfileEditor = function () {
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarError("");
    setAvatarSuccess("");
    setIsEditingProfile(false);
    setProfileError("");
    setProfileSuccess("");
  };

  const handleProfileSubmit = async function (event) {
    event.preventDefault();

    try {
      setIsSavingProfile(true);
      setProfileError("");
      setProfileSuccess("");

      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Profile update failed.");
      }

      const updatedUser = await response.json();

      updateCurrentUser(updatedUser);
      setProfileSuccess("Profile updated successfully.");
      setIsEditingProfile(false);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = function (event) {
    const file = event.target.files[0];

    setAvatarError("");
    setAvatarSuccess("");

    if (!file) {
      setAvatarFile(null);
      setAvatarPreview("");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async function () {
    if (!avatarFile) {
      setAvatarError("Select an image before uploading.");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setAvatarError("");
      setAvatarSuccess("");

      const formData = new FormData();
      formData.append("file", avatarFile);

      const response = await fetch(`${API_URL}/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Avatar upload failed.");
      }

      const updatedUser = await response.json();

      updateCurrentUser(updatedUser);
      setAvatarSuccess("Avatar updated successfully.");
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (error) {
      setAvatarError(error.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const openCreateProjectForm = function () {
    setIsProjectFormOpen(true);
  };

  const closeProjectForm = function () {
    setIsProjectFormOpen(false);
  };

  const handleProjectCreated = function (savedProject) {
    navigate(`/portfolio/projects/${savedProject.id}/manage`);
  };

  return (
    <>
      <MyNavbar />

      <section className="pv-portfolio py-5">
        <Container className=" py-md-4">
          <div className="pv-portfolio-header p-4 p-md-5 mb-4">
            <Row className=" align-items-center g-4">
              <Col xs="auto">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.username} className="pv-profile-avatar" />
                ) : (
                  <div className="pv-profile-avatar-placeholder d-flex align-items-center justify-content-center">
                    <UserRound size={42} />
                  </div>
                )}
              </Col>

              <Col>
                <p className="pv-label mb-2">My Portfolio </p>
                <h1 className=" mb-2">
                  {currentUser?.firstName} {currentUser?.lastName}
                </h1>
                <p className=" mb-2">@{currentUser?.username}</p>
                <p className=" mb-0">{currentUser?.position || "Artist title not set yet"}</p>
              </Col>

              <Col xs="12" lg="auto">
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Button className="pv-btn-secondary rounded-0 px-4 py-3" onClick={openProfileEditor}>
                    Edit Profile
                  </Button>

                  <Button className="pv-btn-primary border-0 rounded-0 px-4 py-3" onClick={openCreateProjectForm}>
                    <Plus size={18} className="me-2" />
                    Create Project
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          {isProfileIncomplete && (
            <div className="pv-complete-profile p-4 mb-5">
              <Row className="align-items-center g-3">
                <Col>
                  <p className="pv-label mb-2">Profile Setup</p>
                  <h2 className="mb-2">Complete your artist profile</h2>
                  <p className="mb-0">Add avatar, artist title and bio to make your portfolio feel complete.</p>
                </Col>

                <Col xs={12} md="auto">
                  <Button className="pv-btn-secondary rounded-0 px-4 py-3" onClick={openProfileEditor}>
                    Edit Profile
                  </Button>
                </Col>
              </Row>
            </div>
          )}

          {isEditingProfile && (
            <div className="pv-portfolio-panel p-4 mb-5">
              <p className="pv-label mb-2">Profile Editor</p>
              <h2 className="mb-4">Edit your artist profile</h2>

              <div className="pv-avatar-editor d-flex flex-column flex-md-row align-items-md-center gap-4 mb-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="pv-profile-avatar" />
                ) : currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.username} className="pv-profile-avatar" />
                ) : (
                  <div className="pv-profile-avatar-placeholder d-flex align-items-center justify-content-center">
                    <UserRound size={42} />
                  </div>
                )}

                <div className="flex-grow-1">
                  <label className="pv-form-label">Avatar</label>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="pv-form-control form-control rounded-0 mb-3" />

                  {avatarError && <p className="pv-form-error mb-2">{avatarError}</p>}
                  {avatarSuccess && <p className="pv-form-success mb-2">{avatarSuccess}</p>}

                  <Button type="button" className="pv-btn-secondary rounded-0 px-4 py-2" onClick={handleAvatarUpload} disabled={isUploadingAvatar}>
                    {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
                  </Button>
                </div>
              </div>

              {profileError && <p className="pv-form-error">{profileError}</p>}
              {profileSuccess && <p className="pv-form-success">{profileSuccess}</p>}

              <form onSubmit={handleProfileSubmit}>
                <Row>
                  <Col md={6}>
                    <label className="pv-form-label">First name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileFormData.firstName}
                      onChange={handleProfileChange}
                      className="pv-form-control form-control rounded-0 mb-3"
                    />
                  </Col>

                  <Col md={6}>
                    <label className="pv-form-label">Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileFormData.lastName}
                      onChange={handleProfileChange}
                      className="pv-form-control form-control rounded-0 mb-3"
                    />
                  </Col>
                </Row>

                <label className="pv-form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={profileFormData.username}
                  onChange={handleProfileChange}
                  className="pv-form-control form-control rounded-0 mb-3"
                />

                <label className="pv-form-label">Artist title</label>
                <input
                  type="text"
                  name="position"
                  value={profileFormData.position}
                  onChange={handleProfileChange}
                  placeholder="3D Environment Artist"
                  className="pv-form-control form-control rounded-0 mb-3"
                />

                <label className="pv-form-label">Bio</label>
                <textarea
                  name="bio"
                  value={profileFormData.bio}
                  onChange={handleProfileChange}
                  rows="5"
                  placeholder="Tell visitors about your art, workflow and tools."
                  className="pv-form-control form-control rounded-0 mb-4"
                ></textarea>

                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Button type="submit" className="pv-btn-primary border-0 rounded-0 px-4 py-3" disabled={isSavingProfile}>
                    {isSavingProfile ? "Saving..." : "Save Profile"}
                  </Button>

                  <Button type="button" className="pv-btn-secondary rounded-0 px-4 py-3" onClick={closeProfileEditor}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {currentUser?.bio && (
            <div className="pv-portfolio-panel p-4 mb-5">
              <p className="pv-label mb-2">Bio</p>
              <p className="mb-0">{currentUser.bio}</p>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-end gap-3 mb-4">
            <div>
              <p className="pv-label mb-2">Projects</p>
              <h2 className="mb-0">Your Projects</h2>
            </div>
          </div>

          {isLoadingProjects && (
            <div className="text-center py-5">
              <Spinner animation="border" className="pv-spinner" />
            </div>
          )}

          {!isLoadingProjects && error && <p className="text-center py-5 mb-0">Your projects are temporarily unavailable</p>}

          {!isLoadingProjects && !error && projects.length === 0 && (
            <div className="pv-portfolio-empty text-center p-5">
              <ImageOff size={36} className="mb-3" />
              <h3 className="mb-2">No projects yet</h3>
              <p className="mb-0">Create your first project to start building your portfolio!</p>
            </div>
          )}

          {!isLoadingProjects && !error && projects.length > 0 && (
            <Row className="g-4">
              {projects.map((project) => (
                <Col xs={12} md={6} lg={4} key={project.id}>
                  <div className="pv-portfolio-project-card h-100">
                    {project.thumbnailUrl ? (
                      <img src={project.thumbnailUrl} alt={project.title} className="pv-project-card-image w-100" />
                    ) : (
                      <div className="pv-project-card-placeholder d-flex align-items-center justify-content-center">
                        <ImageOff size={32} />
                      </div>
                    )}

                    <div className="p-4">
                      <div className="d-flex justify-content-between gap-2 mb-3">
                        <span className="pv-project-tag">{project.categoryName}</span>
                        <span className="pv-project-status">{project.projectVisibility}</span>
                      </div>

                      <h3 className="pv-project-card-title mb-2">{project.title}</h3>
                      <p className="mb-4">{project.projectStatus}</p>

                      <div className="d-flex gap-2">
                        {project.projectVisibility === "PUBLIC" && (
                          <Button as={Link} to={`/projects/${project.id}`} className="pv-btn-secondary rounded-0 px-3 py-2">
                            View
                          </Button>
                        )}

                        <Button as={Link} to={`/portfolio/projects/${project.id}/manage`} className="pv-btn-primary border-0 rounded-0 px-3 py-2">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {isProjectFormOpen && <ProjectForm onHide={closeProjectForm} onSaved={handleProjectCreated} />}

      <MyFooter />
    </>
  );
};

export default MyPortfolio;
