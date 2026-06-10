import { GraduationCap, PlayCircle, BookOpen, FileVideo, Clock } from "lucide-react";

const videos = [
  {
    title: "Demand & Allocation",
    filename: "Training - Demand & Allocation.mp4",
    description:
      "Learn how to create demands, manage allocation workflows, and track approval stages across the Resource Management platform.",
    duration: "~15 min",
    tag: "Core Workflow",
    tagColor: "#2563eb",
    tagBg: "#eff6ff",
  },
];

const upcomingTopics = [
  { icon: "📊", title: "Dashboard & Reporting", eta: "Coming soon" },
  { icon: "👥", title: "Resource Information & Forecasting", eta: "Coming soon" },
  { icon: "📁", title: "Project Portfolio & Scenario Planning", eta: "Coming soon" },
  { icon: "🔐", title: "User Management & Audit Logs", eta: "Coming soon" },
];

export default function Training() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "32px 40px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              borderRadius: 12,
              padding: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GraduationCap size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Training Center
          </h1>
        </div>
        <p style={{ fontSize: 15, color: "#64748b", margin: 0, maxWidth: 620 }}>
          Access training materials and walkthrough videos for the Resource Management
          application. Learn at your own pace with step-by-step guidance.
        </p>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 36,
        }}
      >
        {[
          { icon: <FileVideo size={18} color="#2563eb" />, label: "Training Videos", value: "1 Available", bg: "#eff6ff", border: "#bfdbfe" },
          { icon: <BookOpen size={18} color="#059669" />, label: "Topics Covered", value: "Demand & Allocation", bg: "#f0fdf4", border: "#bbf7d0" },
          { icon: <Clock size={18} color="#d97706" />, label: "More Content", value: "Coming Soon", bg: "#fffbeb", border: "#fde68a" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 12,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Video Cards ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <PlayCircle size={18} color="#2563eb" />
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Training Videos
          </h2>
        </div>

        {videos.map((video, idx) => (
          <div
            key={idx}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              marginBottom: 28,
            }}
          >
            {/* Video label bar */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PlayCircle size={18} color="rgba(255,255,255,0.9)" />
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                  {video.title}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    background: video.tagBg,
                    color: video.tagColor,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  {video.tag}
                </span>
                <span
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Clock size={11} />
                  {video.duration}
                </span>
              </div>
            </div>

            {/* Responsive Video Player */}
            <div style={{ padding: "20px 24px 8px" }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "56.25%", // 16:9 aspect ratio
                  background: "#000",
                  borderRadius: 10,
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                }}
              >
                <video
                  controls
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#000",
                  }}
                  preload="metadata"
                >
                  <source src={`/videos/${video.filename}`} type="video/mp4" />
                  <p style={{ color: "#fff", padding: 20, textAlign: "center" }}>
                    Your browser does not support HTML5 video. Please{" "}
                    <a href={`/videos/${video.filename}`} style={{ color: "#60a5fa" }}>
                      download the video
                    </a>{" "}
                    instead.
                  </p>
                </video>
              </div>

              {/* Description */}
              <div style={{ padding: "16px 4px 12px" }}>
                <p style={{ fontSize: 14, color: "#475569", margin: 0, lineHeight: 1.6 }}>
                  {video.description}
                </p>
              </div>

              {/* File note */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FileVideo size={14} color="#94a3b8" />
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  File: <code style={{ color: "#0f172a", fontWeight: 600 }}>{video.filename}</code>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Upcoming Content ──────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <BookOpen size={17} color="#64748b" />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            More Training Coming Soon
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}
        >
          {upcomingTopics.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: "#f8fafc",
                borderRadius: 10,
                border: "1px dashed #cbd5e1",
              }}
            >
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{t.eta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}