"use client";

import { useState, useEffect } from "react";
import { List, Spin, Empty, Typography, message } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import UploadForm from "./components/UploadForm";
import PhotoCard from "./components/PhotoCard";

const { Title } = Typography;

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
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          <PictureOutlined style={{ marginRight: 8 }} />
          Photo Gallery
        </Title>

        <UploadForm onUploadSuccess={fetchPhotos} />

        <Title level={3}>Gallery</Title>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : photos.length === 0 ? (
          <Empty
            description="No photos yet. Upload your first photo!"
            style={{ padding: 48, background: "#fff", borderRadius: 8 }}
          />
        ) : (
          <List
            grid={{
              gutter: 24,
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 4,
            }}
            dataSource={photos}
            renderItem={(photo) => (
              <List.Item>
                <PhotoCard
                  photo={photo}
                  onCommentAdded={fetchPhotos}
                  formatDate={formatDate}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}
