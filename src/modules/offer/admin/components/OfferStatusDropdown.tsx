import React, { useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { updateOfferStatus } from "@/modules/offer/slice/offerSlice";
import type { Offer } from "@/modules/offer/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/offer";

const OFFER_STATUS: Offer["status"][] = [
  "draft", "preparing", "sent", "pending", "approved", "rejected"
];

const STATUS_LABELS: Record<Offer["status"], string> = {
  draft: "Taslak",
  preparing: "Hazırlanıyor",
  sent: "Gönderildi",
  pending: "Cevap Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi"
};

const STATUS_COLORS: Record<Offer["status"], string> = {
  draft: "#b0b8c5",
  preparing: "#fbbf24",
  sent: "#2b7bfa",
  pending: "#f59e42",
  approved: "#33b47c",
  rejected: "#de3d3d"
};

interface Props {
  offer: Offer;
}

const OfferStatusDropdown: React.FC<Props> = ({ offer }) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("offer", translations);

  const [open, setOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Offer["status"] | null>(null);

  const handleChangeStatus = (status: Offer["status"]) => {
    if (status === offer.status) return;
    setPendingStatus(status);
    dispatch(updateOfferStatus({ id: offer._id!, status }))
      .finally(() => {
        setPendingStatus(null);
        setOpen(false);
      });
  };

  // i18n label helper
  const getLabel = (status: Offer["status"]) =>
    t(`status.${status}`, STATUS_LABELS[status]);

  return (
    <StatusDropdownWrapper>
      <StatusBadge
        $status={offer.status}
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
      >
        {pendingStatus ? (
          <Spinner size={18} />
        ) : (
          getLabel(offer.status)
        )}
        <Chevron $open={open} />
      </StatusBadge>
      {open && (
        <DropdownMenu>
          {OFFER_STATUS.map((status) => (
            <DropdownItem
              key={status}
              $active={status === offer.status}
              $color={STATUS_COLORS[status]}
              onClick={() => handleChangeStatus(status)}
            >
              {getLabel(status)}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </StatusDropdownWrapper>
  );
};

export default OfferStatusDropdown;

// --- Styled ---
const StatusDropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
  min-width: 128px;
`;

const StatusBadge = styled.button<{ $status: Offer["status"] }>`
  background: ${({ $status }) => STATUS_COLORS[$status]};
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 14px;
  padding: 0.27em 1.13em 0.27em 1.05em;
  font-size: 0.98em;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  gap: 0.45em;
  box-shadow: 0 2px 7px rgba(0,0,0,0.04);

  &:hover, &:focus {
    opacity: 0.95;
    filter: brightness(0.98);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  left: 0;
  top: 120%;
  background: #fff;
  min-width: 148px;
  border-radius: 13px;
  box-shadow: 0 5px 24px rgba(30,30,30,0.11);
  z-index: 1100;
  overflow: hidden;
  padding: 0.25em 0;
`;

const DropdownItem = styled.div<{ $active: boolean; $color: string }>`
  padding: 0.6em 1.18em;
  font-size: 1em;
  color: ${({ $active, $color }) => ($active ? "#fff" : $color)};
  background: ${({ $active, $color }) => ($active ? $color : "transparent")};
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background: ${({ $color }) => $color};
    color: #fff;
  }
`;

const Chevron = styled.span<{ $open: boolean }>`
  display: inline-block;
  margin-left: 6px;
  transition: transform 0.19s;
  border: solid #fff;
  border-width: 0 2.1px 2.1px 0;
  padding: 2.7px;
  transform: ${({ $open }) => ($open ? "rotate(-135deg)" : "rotate(45deg)")};
`;

const Spinner = ({ size = 16 }) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      border: "2.5px solid #fff",
      borderRightColor: "#d8d8d8",
      borderRadius: "50%",
      animation: "spin 0.9s linear infinite",
      marginRight: 2,
      verticalAlign: "middle",
    }}
  />
);

