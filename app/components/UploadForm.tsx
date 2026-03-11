"use client";

import { useState } from "react";
import { Upload, Button, Card, Space, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface UploadFormProps {
  onUploadSuccess: () => void;
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      message.success("Photo uploaded successfully!");
      setFileList([]);
      onUploadSuccess();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to upload photo");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
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
  );
}
