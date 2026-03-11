"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Button,
  Card,
  Image,
  List,
  Input,
  message,
  Spin,
  Empty,
  Typography,
  Space,
} from "antd";
import { UploadOutlined, SendOutlined, PictureOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface User {
  name: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: User;
}

interface Photo {
  id: number;
  url: string;
  filename: string | null;
  createdAt: string;
  user: User;
  comments: Comment[];
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [submittingComments, setSubmittingComments] = useState<Record<number, boolean>>({});

  // Fetch all photos on component mount
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

  // Handle photo upload
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Please select a photo to upload");
      return;
    }

    const file = fileList[0];
    if (!file.originFileObj) {
      message.warning("Invalid file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file.originFileObj);

    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      message.success("Photo uploaded successfully!");
      setFileList([]);
      await fetchPhotos();
    } catch (error) {
      message.error("Failed to upload photo");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Handle comment submission
  const handleAddComment = async (photoId: number) => {
    const content = commentInputs[photoId]?.trim();
    if (!content) {
      message.warning("Please enter a comment");
      return;
    }

    setSubmittingComments((prev) => ({ ...prev, [photoId]: true }));

    try {
      const response = await fetch(`/api/photos/${photoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      message.success("Comment added!");
      setCommentInputs((prev) => ({ ...prev, [photoId]: "" }));
      await fetchPhotos();
    } catch (error) {
      message.error("Failed to add comment");
      console.error(error);
    } finally {
      setSubmittingComments((prev) => ({ ...prev, [photoId]: false }));
    }
  };

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

        {/* Upload Section */}
        <Card
          title="Upload a Photo"
          style={{ marginBottom: 24 }}
          styles={{ header: { fontSize: 16, fontWeight: 600 } }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Select Photo</Button>
            </Upload>
            <Button
              type="primary"
              onClick={handleUpload}
              loading={uploading}
              disabled={fileList.length === 0}
            >
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </Space>
        </Card>

        {/* Photo Gallery */}
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
                <Card
                  hoverable
                  cover={
                    <Image
                      src={photo.url}
                      alt={photo.filename || "Photo"}
                      style={{
                        height: 200,
                        objectFit: "cover",
                      }}
                      placeholder
                      fallback="data:image/png;base64,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ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAfgcWLFwPcCeBuAHA3gDsB3AngbgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwN4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8DdAO4GcCeAOwDcDeBOAHcAuBPAnQDuAHAngDsB3AngTgB3ALgTwJ0A7gBwJ4A7ANwJ4E4AdwC4E8CdAO4AcCeAOwDcCeBOAHcAuBPAnQDuBnAngDsB3A3gTgB3ALgTwN0A7gZwJ4A7ANwN4E4AdwC4E8CdAO4AcCeAOwHcCeBOAHcAuBPAnQDuAHA/gd+Mzi7C/gMgAAAABJRU5ErkJggg=="
                    />
                  }
                  styles={{ body: { padding: 16 } }}
                >
                  <Space direction="vertical" style={{ width: "100%" }} size="small">
                    <div>
                      <Text type="secondary">Uploaded by {photo.user.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatDate(photo.createdAt)}
                      </Text>
                    </div>

                    {/* Comments Section */}
                    <div style={{ marginTop: 12 }}>
                      <Text strong>Comments ({photo.comments.length})</Text>

                      {photo.comments.length > 0 && (
                        <div
                          style={{
                            maxHeight: 150,
                            overflowY: "auto",
                            marginTop: 8,
                            marginBottom: 8,
                          }}
                        >
                          {photo.comments.map((comment) => (
                            <div
                              key={comment.id}
                              style={{
                                padding: "8px 12px",
                                background: "#f9f9f9",
                                borderRadius: 8,
                                marginBottom: 8,
                              }}
                            >
                              <div style={{ marginBottom: 4 }}>
                                <Text strong style={{ fontSize: 13 }}>
                                  {comment.user.name}
                                </Text>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: 11, marginLeft: 8 }}
                                >
                                  {formatDate(comment.createdAt)}
                                </Text>
                              </div>
                              <Text style={{ fontSize: 13 }}>{comment.content}</Text>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input */}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <Input
                          placeholder="Add a comment..."
                          value={commentInputs[photo.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [photo.id]: e.target.value,
                            }))
                          }
                          onPressEnter={() => handleAddComment(photo.id)}
                          disabled={submittingComments[photo.id]}
                        />
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={() => handleAddComment(photo.id)}
                          loading={submittingComments[photo.id]}
                        />
                      </div>
                    </div>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}
