"use client";

import { Card, Image, Space, Typography } from "antd";
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

export default function PhotoCard({ photo, onCommentAdded, formatDate }: PhotoCardProps) {
  return (
    <Card
      hoverable
      cover={
        <Image
          src={photo.url}
          alt={photo.filename || "Photo"}
          style={{ height: 200, objectFit: "cover" }}
          placeholder
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk2e1MAAAAAElFTkSuQmCC"
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

        <CommentSection
          photoId={photo.id}
          comments={photo.comments}
          onCommentAdded={onCommentAdded}
          formatDate={formatDate}
        />
      </Space>
    </Card>
  );
}
