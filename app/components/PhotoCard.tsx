"use client";

import { useState } from "react";
import { Card, Image, Typography, Button, Modal, Input, Tooltip, Popconfirm, message } from "antd";
import { ClockCircleOutlined, MessageOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CommentSection from "./CommentSection";

const { Text } = Typography;

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

interface PhotoCardProps {
  photo: Photo;
  onCommentAdded: () => void;
  onPhotoDeleted: () => void;
  onPhotoUpdated: () => void;
  formatDate: (dateString: string) => string;
}

const AVATAR_COLORS = [
  "#667eea", "#764ba2", "#f5576c", "#4facfe",
  "#43e97b", "#fa709a", "#fee140", "#a18cd1",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function PhotoCard({
  photo,
  onCommentAdded,
  onPhotoDeleted,
  onPhotoUpdated,
  formatDate,
}: PhotoCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editFilename, setEditFilename] = useState(photo.filename ?? "");
  const [saving, setSaving] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      message.success("Photo deleted");
      onPhotoDeleted();
    } catch {
      message.error("Failed to delete photo");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: editFilename }),
      });
      if (!res.ok) throw new Error("Update failed");
      message.success("Caption updated");
      setEditOpen(false);
      onPhotoUpdated();
    } catch {
      message.error("Failed to update caption");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card
        hoverable
        cover={
          <div style={{ position: "relative", overflow: "hidden", height: 220, background: "#f5f5f5" }}>
            <Image
              src={photo.url}
              alt={photo.filename || "Photo"}
              style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk2e1MAAAAAElFTkSuQmCC"
            />

            {/* Action buttons — top left */}
            <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}>
              <Tooltip title="Edit caption">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => { setEditFilename(photo.filename ?? ""); setEditOpen(true); }}
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "none",
                    color: "#fff",
                    backdropFilter: "blur(4px)",
                    borderRadius: 6,
                  }}
                />
              </Tooltip>
              <Popconfirm
                title="Delete this photo?"
                description="All comments will also be removed."
                onConfirm={handleDelete}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: deleting }}
              >
                <Tooltip title="Delete photo">
                  <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{
                      background: "rgba(220,38,38,0.7)",
                      border: "none",
                      color: "#fff",
                      backdropFilter: "blur(4px)",
                      borderRadius: 6,
                    }}
                  />
                </Tooltip>
              </Popconfirm>
            </div>

            {/* Comment count badge — top right */}
            {photo.comments.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "rgba(0,0,0,0.55)",
                  borderRadius: 12,
                  padding: "3px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  backdropFilter: "blur(4px)",
                }}
              >
                <MessageOutlined style={{ color: "#fff", fontSize: 11 }} />
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>
                  {photo.comments.length}
                </span>
              </div>
            )}
          </div>
        }
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: "none",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        }}
        styles={{ body: { padding: "14px 16px 16px" } }}
      >
        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: getAvatarColor(photo.user.name),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {photo.user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ lineHeight: 1.35, minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#222" }}>
              {photo.user.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <ClockCircleOutlined style={{ fontSize: 10, color: "#bbb" }} />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {formatDate(photo.createdAt)}
              </Text>
            </div>
          </div>
          {photo.filename && (
            <Text
              type="secondary"
              style={{
                fontSize: 11,
                maxWidth: 110,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              title={photo.filename}
            >
              {photo.filename}
            </Text>
          )}
        </div>

        <CommentSection
          photoId={photo.id}
          comments={photo.comments}
          onCommentAdded={onCommentAdded}
          formatDate={formatDate}
        />
      </Card>

      {/* Edit caption modal */}
      <Modal
        title="Edit Caption"
        open={editOpen}
        onOk={handleEditSave}
        onCancel={() => setEditOpen(false)}
        confirmLoading={saving}
        okText="Save"
        destroyOnHidden
      >
        <Input
          value={editFilename}
          onChange={(e) => setEditFilename(e.target.value)}
          placeholder="Enter a caption or filename"
          maxLength={255}
          onPressEnter={handleEditSave}
          style={{ marginTop: 8 }}
        />
      </Modal>
    </>
  );
}
