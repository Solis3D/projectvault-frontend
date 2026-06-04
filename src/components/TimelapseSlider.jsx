import { useState } from "react";
import { Button } from "react-bootstrap";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

const TimelapseSlider = function ({ images, projectTitle, onImageClick }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const safeActiveIndex = activeIndex >= images.length ? images.length - 1 : activeIndex;
  const activeImage = images[safeActiveIndex];

  const goToPrevious = function () {
    setActiveIndex((currentIndex) => (currentIndex === 0 ? images.length - 1 : currentIndex - 1));
  };

  const goToNext = function () {
    setActiveIndex((currentIndex) => (currentIndex >= images.length - 1 ? 0 : currentIndex + 1));
  };

  const handleSliderChange = function (event) {
    setActiveIndex(Number(event.target.value));
  };

  return (
    <section className="pv-timelapse-section mt-5">
      <div className="mb-3">
        <p className="pv-label mb-2">Workflow Timelapse</p>
        <h2 className="mb-0">Process Sequence</h2>
      </div>

      <div className="pv-timelapse-viewer">
        {activeImage?.imageUrl ? (
          <button type="button" className="pv-image-button" onClick={() => onImageClick(activeImage)}>
            <img src={activeImage.imageUrl} alt={activeImage.caption || activeImage.stageLabel || projectTitle} className="pv-timelapse-image" />
          </button>
        ) : (
          <div className="pv-detail-image-placeholder d-flex align-items-center justify-content-center">
            <ImageOff size={40} />
          </div>
        )}

        {images.length > 1 && (
          <>
            <Button type="button" className="pv-timelapse-control previous" onClick={goToPrevious} title="Previous frame">
              <ChevronLeft size={22} />
            </Button>

            <Button type="button" className="pv-timelapse-control next" onClick={goToNext} title="Next frame">
              <ChevronRight size={22} />
            </Button>
          </>
        )}
      </div>

      <div className="pv-timelapse-meta mt-3">
        <span className="pv-project-tag">
          Frame {safeActiveIndex + 1} / {images.length}
        </span>

        {activeImage?.stageLabel && <h3 className="mt-3 mb-2">{activeImage.stageLabel}</h3>}
        {activeImage?.caption && <p className="mb-0">{activeImage.caption}</p>}
      </div>

      {images.length > 1 && (
        <div className="pv-timelapse-scrubber mt-3">
          <input
            type="range"
            min="0"
            max={images.length - 1}
            value={safeActiveIndex}
            onChange={handleSliderChange}
            className="pv-timelapse-range"
            aria-label="Timelapse frame"
          />

          <div className="pv-timelapse-frame-labels d-flex justify-content-between mt-2">
            <span>Frame 1</span>
            <span>Frame {images.length}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default TimelapseSlider;
