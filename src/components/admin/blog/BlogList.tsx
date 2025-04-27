"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBlogs, deleteBlog } from "@/store/blogSlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { IBlog } from "@/types/blog";

interface Props {
  onEdit?: (blog: IBlog) => void;
}

const languages = ["en", "de", "tr"];

const BlogList: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useAppDispatch();
  const { blogs, loading } = useAppSelector((state) => state.blog);
  const { t } = useTranslation("admin");
  const [selectedLang, setSelectedLang] = useState("en");

  useEffect(() => {
    dispatch(fetchBlogs({ language: selectedLang }));
  }, [dispatch, selectedLang]);

  const handleDelete = async (id: string) => {
    if (
      confirm(
        t("blog.confirmDelete") || "Are you sure you want to delete this blog?"
      )
    ) {
      try {
        await dispatch(deleteBlog(id)).unwrap();
        toast.success(t("blog.deleted"));
      } catch (err: any) {
        toast.error(t("blog.error") + ": " + err.message);
      }
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "-";
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? "-" : format(parsed, "dd.MM.yyyy HH:mm");
  };
  

  return (
    <Container>
      <Header>
        <h3>{t("blog.allBlogs")}</h3>
        <LanguageSelect
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </LanguageSelect>
      </Header>

      {loading ? (
        <p>{t("common.loading")}...</p>
      ) : blogs.length === 0 ? (
        <p>{t("blog.noData") || "No blog entries found."}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>{t("blog.title")}</th>
              <th>{t("blog.createdAt")}</th>
              <th>{t("blog.status")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id}>
                <td>{blog.title}</td>
                <td>{formatDate(blog.createdAt)}</td>


                <td>
                  {blog.isPublished ? t("blog.published") : t("blog.draft")}
                </td>
                <td>
                  <ActionButton onClick={() => onEdit?.(blog)}>
                    {t("common.edit")}
                  </ActionButton>
                  <ActionButton onClick={() => handleDelete(blog._id)}>
                    {t("common.delete")}
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default BlogList;

const Container = styled.div`
  margin-top: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const LanguageSelect = styled.select`
  padding: 8px;
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    border: 1px solid ${({ theme }) => theme.border};
  }

  th {
    background: ${({ theme }) => theme.cardBackground};
    text-align: left;
  }
`;

const ActionButton = styled.button`
  padding: 5px 10px;
  margin-right: 5px;
  background: ${({ theme }) => theme.danger};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;
