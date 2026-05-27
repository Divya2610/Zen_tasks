import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUsers,
  FiLayers,
  FiEdit2,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCircle,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import api from "../utils/api";
import ProjectTree from "../components/ProjectTree";
import Loading from "../components/Loader";

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "on-hold": "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
};

const initials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: `${color}15` }}
    >
      <span style={{ color }}>{icon}</span>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/project/${id}`);
        setProject(data.project);
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20 text-gray-500">Project not found.</div>
    );
  }

  const tasks = project.tasks || [];
  const completedTasks = tasks.filter((t) => t.stage === "completed").length;
  const inProgressTasks = tasks.filter((t) => t.stage === "in progress").length;
  const totalSubTasks = tasks.reduce(
    (acc, t) => acc + (t.subTasks?.length || 0),
    0
  );

  return (
    <div className="w-full px-4 md:px-8 py-6 max-w-6xl">
      {/* Back button */}
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <FiArrowLeft size={15} />
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Color dot */}
            <div
              className="w-12 h-12 rounded-xl flex-shrink-0 mt-0.5"
              style={{ backgroundColor: project.color || "#6366f1" }}
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.name}
                </h1>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${
                    STATUS_STYLES[project.status] || STATUS_STYLES.active
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                {project.description || "No description provided."}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FiCalendar size={11} />
                  Created{" "}
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>by {project.createdBy?.name}</span>
              </div>
            </div>
          </div>

          {user?.isAdmin && (
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 px-3 py-2 rounded-lg transition-colors flex-shrink-0">
              <FiEdit2 size={14} />
              Edit
            </button>
          )}
        </div>

        {/* Team Members */}
        {project.team?.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FiUsers size={12} />
              Team Members
            </p>
            <div className="flex flex-wrap gap-2">
              {project.team.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-2 bg-gray-50 rounded-full pl-1 pr-3 py-1"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                    {initials(member.name)}
                  </div>
                  <span className="text-xs text-gray-700">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<FiLayers size={18} />}
          label="Total Objectives"
          value={tasks.length}
          color="#6366f1"
        />
        <StatCard
          icon={<FiCheckCircle size={18} />}
          label="Completed"
          value={completedTasks}
          color="#10b981"
        />
        <StatCard
          icon={<FiClock size={18} />}
          label="In Progress"
          value={inProgressTasks}
          color="#f59e0b"
        />
        <StatCard
          icon={<FiCircle size={18} />}
          label="Motivations"
          value={totalSubTasks}
          color="#8b5cf6"
        />
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Overall Progress</span>
            <span className="text-gray-500">
              {Math.round((completedTasks / tasks.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((completedTasks / tasks.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Tree View */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Objectives & Motivations
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Click an objective to expand its motivations
            </p>
          </div>
        </div>

        <ProjectTree tasks={tasks} />
      </div>
    </div>
  );
};

export default ProjectDetails;
