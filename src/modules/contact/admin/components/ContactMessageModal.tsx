"use client";
import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { markContactMessageAsRead } from "@/modules/contact/slice/contactSlice";
import { IContactMessage } from "@/modules/contact/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

interface Props {
  message: IContactMessage;
  onClose: () => void;
}

export default function ContactMessageModal({ message, onClose }: Props) {
  const { t } = useI18nNamespace("contact", translations);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (message && !message.isRead) {
      dispatch(markContactMessageAsRead(message._id));
    }
    // eslint-disable-next-line
  }, [message?._id]);

  return (
    <ModalOverlay>
      <ModalBox>
        <h2>{message.subject}</h2>
        <p>
          <b>{t("admin.from", "Gönderen")}:</b> {message.name} ({message.email})
        </p>
        <p>
          <b>{t("admin.date", "Tarih")}:</b> {new Date(message.createdAt).toLocaleString()}
        </p>
        <MsgBody>
          <b>{t("admin.message", "Mesaj")}:</b>
          <div>{message.message}</div>
        </MsgBody>
        <CloseBtn onClick={onClose}>{t("admin.close", "Kapat")}</CloseBtn>
      </ModalBox>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.13); display: flex; align-items: center; justify-content: center; z-index: 999;
`;
const ModalBox = styled.div`
  background: #fff; padding: 34px 28px 24px 28px; border-radius: 10px; min-width: 320px; max-width: 94vw;
  box-shadow: 0 2px 24px rgba(0,0,0,0.14); text-align: left;
`;
const CloseBtn = styled.button`
  margin-top: 18px; background: #5c6bc0; color: #fff; border: none; padding: 10px 22px; border-radius: 7px; cursor: pointer;
`;
const MsgBody = styled.div`
  background: #f6f8fa; padding: 14px 12px; border-radius: 7px; margin: 20px 0 0 0;
`;
