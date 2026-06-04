import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import API_URL from "../config/api";
import useAuth from "../hooks/useAuth";

const ProjectImageUpload = function ({ project, images, onImagesUploaded, onProjectUpdated }) {
  const { token } = useAuth();

  const hasMainImage = images.some((image) => image.imageType === "MAIN");

  const [imageType, setImageType] = useState(hasMainImage ? "GALLERY" : "MAIN");
  const [uploadItems, setUploadItems] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTypeChange = function (event) {
    setImageType(event.target.value);
    setUploadItems([]);
    setFileInputKey((currentKey) => currentKey + 1);
    setError("");
    setSuccess("");
  };

  const handleFilesChange = function (event) {
    const selectedFiles = Array.from(event.target.files);

    const files = imageType === "MAIN" ? selectedFiles.slice(0, 1) : selectedFiles;

    setUploadItems((currentItems) => {
      const highestSavedOrder = images.reduce((highestOrder, image) => Math.max(highestOrder, image.sortOrder ?? -1), -1);

      const highestPendingOrder = currentItems.reduce((highestOrder, item) => Math.max(highestOrder, item.sortOrder ?? -1), -1);

      const nextSortOrder = Math.max(highestSavedOrder, highestPendingOrder) + 1;

      const newItems = files.map((file, index) => ({
        file,
        stageLabel: "",
        caption: "",
        sortOrder: nextSortOrder + index,
      }));

      return imageType === "MAIN" ? newItems : [...currentItems, ...newItems];
    });

    setFileInputKey((currentKey) => currentKey + 1);
  };

  const handleItemChange = function (index, event) {
    const { name, value } = event.target;

    setUploadItems((currentItems) => currentItems.map((item, itemIndex) => (itemIndex === index ? { ...item, [name]: value } : item)));
  };

  const updateProjectThumbnail = async function (imageUrl) {
    const response = await fetch(`${API_URL}/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        thumbnailUrl: imageUrl,
      }),
    });

    if (!response.ok) {
      throw new Error("Main image uploaded, but the project thumbnail could not be updated.");
    }

    onProjectUpdated(await response.json());
  };

  const handleUpload = async function (event) {
    event.preventDefault();

    if (uploadItems.length === 0) {
      setError("Select at least one image.");
      return;
    }

    if (imageType === "MAIN" && hasMainImage) {
      setError("This project already has a main image.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setSuccess("");

      const uploadedImages = [];

      for (const item of uploadItems) {
        const formData = new FormData();

        formData.append("file", item.file);
        formData.append("imageType", imageType);
        formData.append("sortOrder", item.sortOrder);

        if (item.stageLabel.trim()) {
          formData.append("stageLabel", item.stageLabel.trim());
        }

        if (item.caption.trim()) {
          formData.append("caption", item.caption.trim());
        }

        const response = await fetch(`${API_URL}/projects/${project.id}/images/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Unable to upload ${item.file.name}.`);
        }

        const uploadedImage = await response.json();

        uploadedImages.push(uploadedImage);
        onImagesUploaded([uploadedImage]);
      }

      if (imageType === "MAIN") {
        await updateProjectThumbnail(uploadedImages[0].imageUrl);
        setImageType("GALLERY");
      }

      setUploadItems([]);
      setFileInputKey((currentKey) => currentKey + 1);
      setSuccess("Media uploaded successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pv-portfolio-panel p-4 mb-4">
      <p className="pv-label mb-2">Images & Media</p>
      <h2 className="mb-3">Upload Media</h2>

      {error && <p className="pv-form-error">{error}</p>}
      {success && <p className="pv-form-success">{success}</p>}

      <Form onSubmit={handleUpload}>
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Form.Label className="pv-form-label">Media Type</Form.Label>

            <Form.Select value={imageType} onChange={handleTypeChange} className="pv-form-select rounded-0">
              <option value="MAIN" disabled={hasMainImage}>
                Main Image {hasMainImage ? "(already added)" : ""}
              </option>
              <option value="GALLERY">Gallery Images</option>
              <option value="TIMELAPSE">Timelapse Sequence</option>
            </Form.Select>
          </Col>

          <Col md={8}>
            <Form.Label className="pv-form-label">Select Images</Form.Label>

            <Form.Control
              key={fileInputKey}
              type="file"
              accept="image/*"
              multiple={imageType !== "MAIN"}
              onChange={handleFilesChange}
              className="pv-form-control rounded-0"
            />
          </Col>
        </Row>

        {uploadItems.map((item, index) => (
          <div className="pv-media-upload-item p-3 mb-3" key={`${item.file.name}-${index}`}>
            <p className="mb-3">{item.file.name}</p>

            <Row className="g-3">
              <Col md={4}>
                <Form.Control
                  name="stageLabel"
                  value={item.stageLabel}
                  onChange={(event) => handleItemChange(index, event)}
                  placeholder="Stage label"
                  maxLength={50}
                  className="pv-form-control rounded-0"
                />
              </Col>

              <Col md={8}>
                <Form.Control
                  name="caption"
                  value={item.caption}
                  onChange={(event) => handleItemChange(index, event)}
                  placeholder="Caption"
                  maxLength={150}
                  className="pv-form-control rounded-0"
                />
              </Col>
            </Row>
          </div>
        ))}

        <Button type="submit" className="pv-btn-primary border-0 rounded-0 px-4 py-2" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Media"}
        </Button>
      </Form>
    </div>
  );
};

export default ProjectImageUpload;
