"use client";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { FaLeaf, FaSpa, FaHandsHelping, FaHeartbeat } from "react-icons/fa";
import { motion } from "framer-motion";

const Wrapper = styled(motion.section)`
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: ${({ theme }) => theme.text};
`;

const Title = styled.h1`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 3rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBackground || "#fff"};
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.06);
`;

const Icon = styled.div`
  font-size: 2.2rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1rem;
`;

const Name = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary || "#666"};
`;

const iconMap = [<FaLeaf />, <FaSpa />, <FaHandsHelping />, <FaHeartbeat />];

export default function ServicesList() {
  const { t } = useTranslation();

  const serviceList = t("services.items", { returnObjects: true }) as {
    name: string;
    description: string;
  }[];

  return (
    <Wrapper
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>{t("services.title", "Tüm Hizmetlerimiz")}</Title>
      <Grid>
        {serviceList.map((s, i) => (
          <Card
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Icon>{iconMap[i]}</Icon>
            <Name>{s.name}</Name>
            <Description>{s.description}</Description>
          </Card>
        ))}
      </Grid>
    </Wrapper>
  );
}
