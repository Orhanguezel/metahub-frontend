"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchFAQs, deleteFAQ, updateFAQ } from "@/store/faqSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function FAQList() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("admin");

  const { faqs, loading, error, successMessage } = useSelector(
    (state: RootState) => state.faq
  );

  const [selectedLang, setSelectedLang] = useState<"tr" | "en" | "de">("en");
  const [editingFAQ, setEditingFAQ] = useState<null | (typeof faqs)[0]>(null);

  const { i18n } = useTranslation("admin");

  useEffect(() => {
    dispatch(fetchFAQs(i18n.language));
  }, [dispatch, i18n.language]);

  useEffect(() => {
    if (error) toast.error(error);
    if (successMessage) toast.success(successMessage);
  }, [error, successMessage]);

  const handleDelete = (id: string) => {
    if (confirm(t("common.confirmDelete") || "Are you sure?")) {
      dispatch(deleteFAQ(id));
    }
  };

  const filteredFaqs = faqs.filter((faq) => faq.language === selectedLang);

  return (
    <Container>
      <TopBar>
        <h3>📋 {t("faqs.all")}</h3>
        <Select
          value={selectedLang}
          onChange={(e) =>
            setSelectedLang(e.target.value as "tr" | "en" | "de")
          }
        >
          <option value="en">🇬🇧 EN</option>
          <option value="tr">🇹🇷 TR</option>
          <option value="de">🇩🇪 DE</option>
        </Select>
      </TopBar>

      {loading && <p>{t("common.loading")}...</p>}
      {!loading && filteredFaqs.length === 0 && <p>{t("faqs.noFaqs")}</p>}

      {!loading && filteredFaqs.length > 0 && (
        <Table>
          <thead>
            <tr>
              <th>{t("faqs.question")}</th>
              <th>{t("faqs.answer")}</th>
              <th>{t("faqs.language")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredFaqs.map((faq) => (
              <tr key={faq._id}>
                <td>{faq.question}</td>
                <td>{faq.answer}</td>
                <td>{faq.language}</td>
                <td>
                  <ButtonGroup>
                    <EditBtn onClick={() => setEditingFAQ(faq)}>
                      {t("common.edit")}
                    </EditBtn>
                    <DeleteBtn onClick={() => handleDelete(faq._id!)}>
                      {t("common.delete")}
                    </DeleteBtn>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {editingFAQ && (
        <FAQEditModal
          faq={editingFAQ}
          onClose={() => setEditingFAQ(null)}
          onSave={(updated) => {
            dispatch(updateFAQ(updated))
              .unwrap()
              .then(() => {
                toast.success(t("faqs.updated"));
                setEditingFAQ(null);
              })
              .catch(() => toast.error(t("faqs.error")));
          }}
        />
      )}
    </Container>
  );
}

// Dummy Modal — ayrı dosyaya taşıyabilirsin
const FAQEditModal = ({
  faq,
  onClose,
  onSave,
}: {
  faq: any;
  onClose: () => void;
  onSave: (updated: any) => void;
}) => {
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);

  return (
    <Overlay>
      <Modal>
        <h4>✏️ SSS Düzenle</h4>

        <Label>Soru</Label>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Label>Cevap</Label>
        <TextArea
          rows={3}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <ButtonGroup>
          <EditBtn onClick={() => onSave({ ...faq, question, answer })}>
            Kaydet
          </EditBtn>
          <DeleteBtn onClick={onClose}>İptal</DeleteBtn>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

// Styled Components
const Container = styled.div`
  margin-top: 2rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.tableHeader};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const DeleteBtn = styled.button`
  background: ${({ theme }) => theme.danger};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const EditBtn = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
`;

const Label = styled.label`
  font-weight: 600;
  margin-top: 1rem;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  font-size: 1rem;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  resize: vertical;
  font-size: 1rem;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;
