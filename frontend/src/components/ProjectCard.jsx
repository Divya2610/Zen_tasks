import React from "react";
import { useNavigate } from "react-router-dom";
import { FiFolder, FiUsers, FiLayers, FiArrowRight } from "react-icons/fi";

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700",
  "on-hold": "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
};

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const initials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: project.color || "#6366f1" }}
      />

      <div className="p-5 pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${project.color}20` || "#6366f120" }}
          >
            <FiFolder
              size={20}
              style={{ color: project.color || "#6366f1" }}
            />
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
              STATUS_STYLES[project.status] || STATUS_STYLES.active
            }`}
          >
            {project.status}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-semibold text-gray-900 text-base mb-1 group-hover:text-indigo-600 transition-colors">
          {project.name}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
          {project.description || "No description provided."}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <FiLayers size={12} />
            {project.tasks?.length || 0} objectives
          </span>
          <span className="flex items-center gap-1">
            <FiUsers size={12} />
            {project.team?.length || 0} members
          </span>
        </div>

        {/* Team avatars */}
        {project.team?.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {project.team.slice(0, 4).map((member, i) => (
                <div
                  key={member._id || i}
                  title={member.name}
                  className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-indigo-600"
                >
                  {initials(member.name)}
                </div>
              ))}
              {project.team.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-500">
                  +{project.team.length - 4}
                </div>
              )}
            </div>
            <FiArrowRight
              size={16}
              className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
