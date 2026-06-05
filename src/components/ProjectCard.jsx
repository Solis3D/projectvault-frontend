import { ImageOff } from "lucide-react";
import { Link } from "react-router-dom";

const ProjectCard = function ({ project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className={project.featured ? "pv-project-card pv-project-card-featured d-block h-100" : "pv-project-card d-block h-100"}
    >
      <div className="position-relative">
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.title} className="pv-project-card-image w-100" />
        ) : (
          <div className="pv-project-card-placeholder d-flex align-items-center justify-content-center">
            <ImageOff size={32} />
          </div>
        )}

        {project.featured && <span className="pv-featured-badge">Featured</span>}
      </div>

      <div className="p-4">
        <h3 className="pv-project-card-title mb-2">{project.title}</h3>

        <p className="mb-4">by {project.ownerUsername}</p>

        <div className="d-flex justify-content-between align-items-center gap-2">
          <span className="pv-project-tag">{project.categoryName}</span>
          <span className="pv-project-status">{project.projectStatus}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
