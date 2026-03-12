"use client";

import { useState } from "react";
import { Upload, Button, Card, message, Typography } from "antd";
import { CloudUploadOutlined, FileImageOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

const { Text } = Typography;
const { Dragger } = Upload;

interface UploadFormProps {
  onUploadSuccess: () => void;
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Please select at least one photo to upload");
      return;
    }

    const files = fileList
      .map((f) => f.originFileObj)
      .filter((f): f is NonNullable<typeof f> => f != null);

    if (files.length === 0) {
      message.warning("Invalid file selection");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    try {
      const response = await fetch("/api/photos", { method: "POST", body: formData });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }
      const uploaded = await response.json();
      const count = Array.isArray(uploaded) ? uploaded.length : 1;
      message.success(`${count} photo${count > 1 ? "s" : ""} uploaded successfully!`);
      setFileList([]);
      onUploadSuccess();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to upload photos");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card
      style={{
        marginBottom: 32,
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        border: "none",
        overflow: "hidden",
      }}
      styles={{ body: { padding: 24 } }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CloudUploadOutlined style={{ color: "#fff", fontSize: 20 }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#222" }}>Upload Photos</div>
          <div style={{ color: "#999", fontSize: 12 }}>JPEG, PNG, GIF, WebP or AVIF · Max 10 MB each · Multiple allowed</div>
        </div>
      </div>

      {/* Dragger */}
      <Dragger
        fileList={fileList}
        onChange={({ fileList }) => setFileList(fileList)}
        beforeUpload={() => false}
        multiple
        accept="image/*"
        listType="picture"
        style={{ borderRadius: 10 }}
      >
        <div style={{ padding: "20px 0" }}>
          <FileImageOutlined style={{ fontSize: 44, color: "#667eea", display: "block", marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 4 }}>
            Drag &amp; drop your photos here
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            or <span style={{ color: "#667eea", fontWeight: 500 }}>click to browse</span>
          </Text>
        </div>
      </Dragger>

      {/* Upload button */}
      <Button
        type="primary"
        icon={<CloudUploadOutlined />}
        onClick={handleUpload}
        loading={uploading}
        disabled={fileList.length === 0}
        size="large"
        style={{
          marginTop: 16,
          width: "100%",
          height: 46,
          borderRadius: 10,
          background: fileList.length === 0
            ? undefined
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: 0.3,
        }}
      >
        {uploading ? "Uploading…" : fileList.length > 1 ? `Upload ${fileList.length} Photos` : "Upload Photo"}
      </Button>
    </Card>
  );
}
