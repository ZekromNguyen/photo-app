"use client";

import { useState } from "react";
import { Input, Button, Typography, message } from "antd";
import { SendOutlined, MessageOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: { name: string };
}

interface CommentSectionProps {
  photoId: number;
  comments: Comment[];
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

export default function CommentSection({
  photoId,
  comments,
  onCommentAdded,
  formatDate,
}: CommentSectionProps) {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const content = input.trim();
    if (!content) {
      message.warning("Please enter a comment");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/photos/${photoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      message.success("Comment added!");
      setInput("");
      onCommentAdded();
    } catch (error) {
      message.error("Failed to add comment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Comment count header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <MessageOutlined style={{ color: "#667eea", fontSize: 12 }} />
        <Text strong style={{ fontSize: 12, color: "#555" }}>
          {comments.length === 0
            ? "No comments yet"
            : `${comments.length} comment${comments.length > 1 ? "s" : ""}`}
        </Text>
      </div>

      {/* Comment list */}
      {comments.length > 0 && (
        <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 10 }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: getAvatarColor(comment.user.name),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div
                style={{
                  flex: 1,
                  background: "#f8f9fa",
                  borderRadius: "0 8px 8px 8px",
                  padding: "6px 10px",
                  minWidth: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                  <Text strong style={{ fontSize: 12, color: "#333" }}>
                    {comment.user.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {formatDate(comment.createdAt)}
                  </Text>
                </div>
                <Text style={{ fontSize: 12, color: "#555", wordBreak: "break-word" }}>
                  {comment.content}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSubmit}
          placeholder="Add a comment..."
          style={{ borderRadius: 20, fontSize: 13 }}
          maxLength={1000}
          disabled={submitting}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={submitting}
          disabled={!input.trim()}
          style={{
            borderRadius: 20,
            background: input.trim()
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : undefined,
            border: "none",
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
}


interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: { name: string };
}

interface CommentSectionProps {
  photoId: number;
  comments: Comment[];
  onCommentAdded: () => void;
  formatDate: (dateString: string) => string;
}
