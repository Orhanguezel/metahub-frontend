"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchServices,
  deleteService,
  updateService,
} from "@/store/servicesSlice";
import EditModal from "./EditModal";
import { IService } from "@/store/servicesSlice";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Item = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h4`
  margin: 0;
`;

const Button = styled.button`
  padding: 0.4rem 0.6rem;
  margin-left: 0.5rem;
  font-size: 0.85rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;

  &.edit {
    background-color: #4caf50;
  }
  &.delete {
    background-color: #f44336;
  }
`;

const Toggle = styled.button<{ $active: boolean }>`
  padding: 0.3rem 0.6rem;
  background-color: ${({ $active }) => ($active ? "green" : "gray")};
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

export default function ServiceList() {
  const dispatch = useDispatch<AppDispatch>();
  const { services, loading } = useSelector((state: RootState) => state.services);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<IService | null>(null);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    if (confirm("Bu hizmeti silmek istediğinize emin misiniz?")) {
      dispatch(deleteService(id));
    }
  };

  const handleToggleActive = (service: IService) => {
    const formData = new FormData();
    formData.append("isActive", (!service.isActive).toString());
    dispatch(updateService({ id: service._id!, formData }));
  };

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SearchInput
        placeholder="Hizmet ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Yükleniyor...</p>}

      <List>
        {filteredServices.map((service) => (
          <Item key={service._id}>
            <Info>
              <Title>{service.title}</Title>
              <small>
                {service.shortDescription} - €{service.price} / {service.durationMinutes} dk
              </small>
            </Info>
            <div>
              <Toggle
                $active={!!service.isActive}
                onClick={() => handleToggleActive(service)}
              >
                {service.isActive ? "Aktif" : "Pasif"}
              </Toggle>
              <Button className="edit" onClick={() => setEditing(service)}>Düzenle</Button>
              <Button className="delete" onClick={() => handleDelete(service._id!)}>
                Sil
              </Button>
            </div>
          </Item>
        ))}
      </List>

      {editing && (
        <EditModal
          service={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
