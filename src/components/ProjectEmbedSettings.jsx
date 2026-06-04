import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import API_URL from "../config/api";
import useAuth from "../hooks/useAuth";
import { getYouTubeEmbedUrl } from "../utils/mediaUtils";

const ProjectEmbedSettings = function ({ project, onProjectUpdated }) {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    youtubeUrl: project.youtubeUrl || "",
    viewerType: "NONE",
    modelUrl: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = function (event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async function (event) {
    event.preventDefault();

    if (formData.youtubeUrl.trim() && !getYouTubeEmbedUrl(formData.youtubeUrl.trim())) {
      setError("Use a valid YouTube link.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          youtubeUrl: formData.youtubeUrl.trim(),
          viewerType: "NONE",
          modelUrl: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.errors?.join(" ") || errorData.message || "Unable to save embed settings.");
      }

      const updatedProject = await response.json();

      onProjectUpdated(updatedProject);
      setSuccess("Embed settings updated.");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pv-detail-panel p-4 mb-4">
      <p className="pv-panel-label mb-3">Video & Viewer</p>

      {error && <p className="pv-form-error">{error}</p>}
      {success && <p className="pv-form-success">{success}</p>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="pv-form-label">YouTube Video URL</Form.Label>
          <Form.Control
            type="url"
            name="youtubeUrl"
            value={formData.youtubeUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className="pv-form-control rounded-0"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="pv-form-label">3D Viewer</Form.Label>
          <Form.Select name="viewerType" value={formData.viewerType} onChange={handleChange} className="pv-form-select rounded-0">
            <option value="NONE">No viewer</option>
            <option value="MARMOSET" disabled>
              Marmoset Viewer - Coming Soon
            </option>
            <option value="INTERNAL" disabled>
              ProjectVault Viewer - Coming Soon
            </option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" className="pv-btn-secondary rounded-0 px-4 py-2" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Embeds"}
        </Button>
      </Form>
    </div>
  );
};

export default ProjectEmbedSettings;
