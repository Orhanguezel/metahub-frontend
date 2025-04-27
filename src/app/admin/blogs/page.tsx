"use client";

import React, { useState } from "react";
import styled from "styled-components";
import BlogMultiForm from "@/components/admin/blog/BlogMultiForm";
import BlogList from "@/components/admin/blog/BlogList";
import BlogEditModal from "@/components/admin/blog/BlogEditModal";
import { IBlog } from "@/types/blog";



const AdminBlogPage: React.FC = () => {
  const [selectedBlog, setSelectedBlog] = useState<IBlog | null>(null);

  return (
    <Wrapper>
      <Section>
      <BlogMultiForm />
      
      </Section>

      <Section>
        <BlogListWrapper>
          <BlogList onEdit={(blog) => setSelectedBlog(blog)} />
        </BlogListWrapper>
      </Section>

      {selectedBlog && (
        <BlogEditModal
          isOpen={true}
          onClose={() => setSelectedBlog(null)}
          blog={selectedBlog}
        />
      )}
    </Wrapper>
  );
};

export default AdminBlogPage;

const Wrapper = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const BlogListWrapper = styled.div`
  margin-top: 2rem;
`;


