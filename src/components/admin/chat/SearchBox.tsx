import React, { useState } from "react";
import styled from "styled-components";
import { Search } from "lucide-react"; // veya herhangi bir icon paketi

interface Props {
  onSearch: (term: string) => void;
}

const SearchBox: React.FC<Props> = ({ onSearch }) => {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setValue(term);
    onSearch(term);
  };

  return (
    <Wrapper>
      <SearchIcon />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Mesajlarda ara..."
      />
    </Wrapper>
  );
};

export default SearchBox;

// 💅 Styles
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #ccc;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  border: none;
  outline: none;
  flex: 1;
`;

const SearchIcon = styled(Search)`
  width: 18px;
  height: 18px;
  color: #888;
`;
