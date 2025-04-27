"use client";

import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { format } from "date-fns";

interface Props {
  blog: any;
}

const BlogCard: React.FC<Props> = ({ blog }) => {
  return (
    <Card>
      <Thumbnail src={blog.images?.[0]} alt={blog.title} />
      <Content>
        <Category>{blog.category}</Category>
        <Link href={`/visitor/blogs/${blog.slug}`}>
          <Title>{blog.title}</Title>
        </Link>
        <Summary>{blog.summary}</Summary>
        <Meta>{format(new Date(blog.publishedAt), "PPP")}</Meta>
      </Content>
    </Card>
  );
};

export default BlogCard;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  overflow: hidden;
  background: ${({ theme }) => theme.cardBackground};
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 1rem;
`;

const Category = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.primary};
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin: 0.5rem 0;
`;

const Summary = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const Meta = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textLight};
  margin-top: 0.5rem;
`;
