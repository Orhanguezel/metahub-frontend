import styled from "styled-components";

// Form
const Form = styled.form`
   max-width: 400px;
  margin: 4rem auto;
  background: ${({ theme }) => theme.backgroundSecondary};
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  color: ${({ theme }) => theme.text};
`;

// Form Group
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// Label
const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.text};
`;

// Input Wrapper
const InputWrapper = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ $hasError, theme }) => ($hasError ? theme.danger : theme.border)};
  background-color: ${({ theme }) => theme.inputBackground};
  transition: border 0.2s ease;
`;

// Input Icon (FaUser, FaLock, vs)
const Icon = styled.span`
  margin-right: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1rem;
  opacity: 0.6;
`;

// Input alanı
const Input = styled.input<{ $hasError?: boolean }>`
  flex: 1;
  padding: 0.75rem 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-family: ${({ theme }) => theme.fonts.body};

  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.4;
    font-style: italic;
  }

  &:focus {
    outline: none;
  }
`;

// Şifre göster/gizle butonu
const TogglePassword = styled.button`
  background: none;
  border: none;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1rem;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

// Hata mesajı
const ErrorMessage = styled.div`
  margin-top: 0.4rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.danger};
`;

// KVKK metni
const Terms = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  margin: 1.5rem 0;
`;

// Buton
const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};

  &:hover {
    background-color: ${({ theme }) => theme.primaryHover};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Alternatif işlem (girişe yönlendir)
const AltAction = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px dashed ${({ theme }) => theme.border};

  a {
    color: ${({ theme }) => theme.primary};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export {
  Form,
  FormGroup,
  Label,
  InputWrapper,
  Icon,
  Input,
  TogglePassword,
  ErrorMessage,
  Terms,
  SubmitButton,
  AltAction,
};
