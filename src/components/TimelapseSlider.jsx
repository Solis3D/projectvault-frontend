import { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

const TimelapseSlider = function ({ images, projectTitle, onImageClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousImage, setPreviousImage] = useState(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const crossfadeTimeoutRef = useRef(null);

  const safeActiveIndex = activeIndex >= images.length ? images.length - 1 : activeIndex;
  const activeImage = images[safeActiveIndex];

  useEffect(() => {
    images.forEach((image) => {
      if (image.imageUrl) {
        const preloadedImage = new Image();
        preloadedImage.src = image.imageUrl;
      }
    });
  }, [images]);

  useEffect(() => {
    return () => {
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
      }
    };
  }, []);

  if (images.length === 0) {
    return null;
  }

  const changeFrame = function (nextIndex, withCrossfade = true) {
    if (nextIndex === safeActiveIndex) {
      return;
    }

    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
    }

    if (withCrossfade && activeImage?.imageUrl) {
      setPreviousImage(activeImage);
      setIsCrossfading(true);

      crossfadeTimeoutRef.current = setTimeout(() => {
        setPreviousImage(null);
        setIsCrossfading(false);
      }, 220);
    } else {
      setPreviousImage(null);
      setIsCrossfading(false);
    }

    setActiveIndex(nextIndex);
  };

  const goToPrevious = function () {
    changeFrame(safeActiveIndex === 0 ? images.length - 1 : safeActiveIndex - 1);
  };

  const goToNext = function () {
    changeFrame(safeActiveIndex >= images.length - 1 ? 0 : safeActiveIndex + 1);
  };

  const handleSliderChange = function (event) {
    changeFrame(Number(event.target.value), false);
  };

  return (
    <section className="pv-timelapse-section mt-5">
      <div className="mb-3">
        <p className="pv-label mb-2">Workflow Timelapse</p>
        <h2 className="mb-0">Process Sequence</h2>
      </div>

      <div className="pv-timelapse-viewer">
        {activeImage?.imageUrl ? (
          <button type="button" className="pv-image-button pv-timelapse-image-button" onClick={() => onImageClick(activeImage)}>
            <span className="pv-timelapse-image-stack">
              <img src={activeImage.imageUrl} alt={activeImage.caption || activeImage.stageLabel || projectTitle} className="pv-timelapse-image" />

              {previousImage?.imageUrl && isCrossfading && (
                <img src={previousImage.imageUrl} alt="" className="pv-timelapse-image pv-timelapse-image-previous" aria-hidden="true" />
              )}
            </span>
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
