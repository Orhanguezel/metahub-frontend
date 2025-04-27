"use client";

import React from "react";
import styled from "styled-components";

interface Props {
  url: string;
  title?: string;
}

const SocialShareButtons: React.FC<Props> = ({ url, title }) => {
  return (
    <Wrapper>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Facebook'ta paylaş"
      >
        <i className="fab fa-facebook-f" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || "")}`}
        target="_blank"
        rel="noopener noreferrer"
        title="X'te (Twitter) paylaş"
      >
        <i className="fab fa-x-twitter" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="LinkedIn'de paylaş"
      >
        <i className="fab fa-linkedin-in" />
      </a>
    </Wrapper>
  );
};

export default SocialShareButtons;

const Wrapper = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 1.5rem;

  a {
    font-size: 1.4rem;
    color: #444;
    transition: 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.primary};
    }
  }
`;



/*
<SocialShareButtons
  url={`https://ensotek.com/blog/${blog.slug}`}
  title={blog.title}
/>
*/