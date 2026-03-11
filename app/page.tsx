"use client";

import { useState, useEffect } from "react";
import { List, Spin, Empty, Typography, Divider, message } from "antd";
import { PictureOutlined, CameraOutlined } from "@ant-design/icons";
import UploadForm from "./components/UploadForm";
import PhotoCard from "./components/PhotoCard";

const { Title, Text } = Typography;

interface Photo {
  id: number;
  url: string;
  filename: string | null;
  createdAt: string;
  user: { name: string };
  comments: {
    id: number;
    content: string;
    createdAt: string;
    user: { name: string };
  }[];
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      if (!response.ok) throw new Error("Failed to fetch photos");
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      message.error("Failed to load photos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Hero Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "52px 16px 72px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background circles */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -70, left: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: 20, left: "15%", width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <CameraOutlined style={{ fontSize: 34, color: "#fff" }} />
          </div>
          <Title level={1} style={{ color: "#fff", margin: 0, fontSize: 38, fontWeight: 700, letterSpacing: -0.5 }}>
            Photo Gallery
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, display: "block", marginTop: 10 }}>
            Upload and share your favourite moments
          </Text>
          {!loading && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",
                borderRadius: 20,
                padding: "6px 18px",
                marginTop: 18,
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <PictureOutlined style={{ color: "#fff", fontSize: 14 }} />
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
                {photos.length} {photos.length === 1 ? "photo" : "photos"} shared
              </Text>
            </div>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "-40px auto 0", padding: "0 16px 60px" }}>
        <UploadForm onUploadSuccess={fetchPhotos} />

        <Divider
          style={{ fontSize: 17, fontWeight: 600, color: "#444", marginTop: 8, marginBottom: 24 }}
        >
          <PictureOutlined style={{ marginRight: 8, color: "#667eea" }} />
          All Photos
        </Divider>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: "#888", fontSize: 15 }}>Loading photos…</div>
          </div>
        ) : photos.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: "#888", fontSize: 15 }}>
                No photos yet — be the first to upload!
              </span>
            }
            style={{
              padding: 72,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          />
        ) : (
          <List
            grid={{ gutter: 20, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={photos}
            renderItem={(photo) => (
              <List.Item>
                <PhotoCard photo={photo} onCommentAdded={fetchPhotos} formatDate={formatDate} />
              </List.Item>
            )}
          />
        )}
      </div>

      <footer
        style={{
          textAlign: "center",
          padding: "20px 16px",
          color: "#bbb",
          fontSize: 13,
          borderTop: "1px solid #e8e8e8",
          background: "#fff",
        }}
      >
        Photo Gallery App — Built with Next.js, Ant Design &amp; PostgreSQL
      </footer>
    </div>
  );
}
