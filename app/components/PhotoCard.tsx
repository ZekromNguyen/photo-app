"use client";

import { Card, Image, Typography } from "antd";
import { ClockCircleOutlined, MessageOutlined } from "@ant-design/icons";
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

export default function PhotoCard({ photo, onCommentAdded, formatDate }: PhotoCardProps) {
  return (
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
        <div style={{ lineHeight: 1.35, minWidth: 0 }}>
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
      </div>

      <CommentSection
        photoId={photo.id}
        comments={photo.comments}
        onCommentAdded={onCommentAdded}
        formatDate={formatDate}
      />
    </Card>
  );
}
