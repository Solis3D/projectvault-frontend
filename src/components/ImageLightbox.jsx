import { Button, Modal } from "react-bootstrap";
import { X } from "lucide-react";

const ImageLightbox = function ({ image, title, onHide }) {
  if (!image) {
    return null;
  }

  return (
    <Modal show fullscreen onHide={onHide} contentClassName="pv-lightbox-modal">
      <Modal.Body className="pv-lightbox-body">
        <Button type="button" className="pv-lightbox-close" onClick={onHide} title="Close image preview">
          <X size={24} />
        </Button>

        <img src={image.imageUrl} alt={image.caption || image.stageLabel || title} className="pv-lightbox-image" />

        {(image.stageLabel || image.caption) && (
          <div className="pv-lightbox-caption">
            {image.stageLabel && <p className="pv-label mb-2">{image.stageLabel}</p>}
            {image.caption && <p className="mb-0">{image.caption}</p>}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ImageLightbox;
