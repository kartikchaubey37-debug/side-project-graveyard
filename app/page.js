"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import "./globals.css";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    setProjects(data || []);
  }

  const filtered = projects.filter((p) => {
    const matchFilter =
      filter === "all" || p.status === filter;

    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search);

    return matchFilter && matchSearch;
  });

  return (
    <>
      <Navbar onSubmit={() => setShowSubmit(true)} />

      <Hero />

      <Filters setFilter={setFilter} setSearch={setSearch} />

      <div className="main">
        <div className="projects-grid">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onClick={() => setSelectedProject(p)}
            />
          ))}
        </div>
      </div>

      {showSubmit && (
        <SubmitModal
          onClose={() => setShowSubmit(false)}
          onSuccess={loadProjects}
        />
      )}

      {selectedProject && (
        <DetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}

// ================= COMPONENTS =================

function Navbar({ onSubmit }) {
  return (
    <nav>
      <a className="logo">🪦 Side Project Graveyard</a>
      <div className="nav-actions">
        <button className="btn btn-ghost" onClick={onSubmit}>
          Submit a project
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-eyebrow">
        Rest in peace — or find a new owner
      </div>
      <h1>
        Your abandoned project<br />
        deserves a <em>second life.</em>
      </h1>
      <p className="hero-sub">
        A graveyard for side projects that didn't make it.
      </p>
    </section>
  );
}

function Filters({ setFilter, setSearch }) {
  return (
    <div className="filters-bar">
      <button className="chip" onClick={() => setFilter("all")}>
        All
      </button>
      <button className="chip" onClick={() => setFilter("adopt")}>
        Free to adopt
      </button>
      <button className="chip" onClick={() => setFilter("sale")}>
        For sale
      </button>

      <div className="search-wrap">
        <input
          placeholder="Search projects..."
          onChange={(e) =>
            setSearch(e.target.value.toLowerCase())
          }
        />
      </div>
    </div>
  );
}

function ProjectCard({ project, onClick }) {
  return (
    <div className="project-card" onClick={onClick}>
      <div className="card-header">
        <div className="card-name">{project.name}</div>
      </div>
      <div className="card-desc">{project.description}</div>
    </div>
  );
}

function SubmitModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  async function submit() {
    await supabase.from("projects").insert([
      {
        name,
        description: desc,
        status: "adopt",
      },
    ]);

    onSuccess();
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <h2>Bury a project</h2>

        <input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button className="btn btn-primary" onClick={submit}>
          Submit
        </button>

        <button className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function DetailModal({ project, onClose }) {
  return (
    <div className="modal-overlay open">
      <div className="modal">
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
