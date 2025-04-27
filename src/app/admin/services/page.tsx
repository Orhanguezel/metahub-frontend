"use client";

import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useEffect } from "react";
import ServiceForm from "./ServiceForm";
import ServiceList from "./ServiceList";
import { clearServiceMessages, fetchServices } from "@/store/servicesSlice";

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  margin-bottom: 1rem;
`;

const Message = styled.p<{ error?: boolean }>`
  color: ${({ error }) => (error ? "red" : "green")};
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

export default function AdminServicesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { error, successMessage } = useSelector((state: RootState) => state.services);

  useEffect(() => {
    dispatch(fetchServices());

    return () => {
      dispatch(clearServiceMessages());
    };
  }, [dispatch]);

  return (
    <Container>
      <Title>Hizmet Yönetimi</Title>
      {error && <Message error>{error}</Message>}
      {successMessage && <Message>{successMessage}</Message>}

      <ServiceForm />
      <ServiceList />
    </Container>
  );
}
