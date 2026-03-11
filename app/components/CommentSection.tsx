"use client";

import { useState } from "react";
import { Input, Button, Typography, message } from "antd";
import { SendOutlined } from "@ant-design/icons";

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
    <div style={{ marginTop: 12 }}>
      <Text strong>Comments ({comments.length})</Text>

      {comments.length > 0 && (
        <div
          style={{
            maxHeight: 150,
            overflowY: "auto",
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          {comments.map((comment) => (
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

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Input
          placeholder="Add a comment..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSubmit}
          disabled={submitting}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={submitting}
        />
      </div>
    </div>
  );
}
