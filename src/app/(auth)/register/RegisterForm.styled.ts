import styled from "styled-components";

// Form
const Form = styled.form`
  max-width: 400px;
  margin: ${({ theme }) => theme.spacing.lg} auto;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  color: ${({ theme }) => theme.colors.text};
`;

// Form Group
const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

// Label
const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

// Input Wrapper
const InputWrapper = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ $hasError, theme }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  transition: ${({ theme }) => theme.transition.fast};

  &:focus-within {
    border-color: ${({ $hasError, theme }) => ($hasError ? theme.colors.danger : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

// Input Icon (FaUser, FaLock, vs)
const Icon = styled.span`
  margin-right: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  opacity: 0.6;
`;

// Input alanı
const Input = styled.input<{ $hasError?: boolean }>`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing.sm} 0`};
  font-size: ${({ theme }) => theme.fontSizes.base};
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.5;
    font-style: italic;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  &:focus {
    outline: none;
  }
`;

// Şifre göster/gizle butonu
const TogglePassword = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

// Hata mesajı
const ErrorMessage = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
`;

// KVKK metni
const Terms = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin: ${({ theme }) => `${theme.spacing.lg} 0`};
`;

// Buton
const SubmitButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);

    &::before {
      left: 100%;
    }
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
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    text-decoration: none;
    transition: ${({ theme }) => theme.transition.fast};

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
