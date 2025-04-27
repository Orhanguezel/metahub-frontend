import styled from "styled-components";

export const Form = styled.form`
  width: 100%;
  max-width: 480px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.light};
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.text};
  }
`;

export const InputWrapper = styled.div<{ $hasError?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  width: 100%;
  border: 1px solid ${({ $hasError, theme }) => ($hasError ? theme.danger : theme.border)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.inputBackground};
  border-bottom: 2px solid ${({ $hasError, theme }) => ($hasError ? theme.danger : theme.primaryTransparent)};
  transition: ${({ theme }) => theme.transition.normal};

  &:focus-within {
    border-color: ${({ $hasError, theme }) => ($hasError ? theme.danger : theme.primary)};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primaryTransparent};
    border-bottom-color: ${({ theme }) => theme.primaryHover};
  }
`;

export const Icon = styled.div`
  margin-left: 0.5rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.5;
`;

export const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.text};
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.muted};
    font-style: italic;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  &:focus {
    outline: none;
  }
`;

export const TogglePassword = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    color: ${({ theme }) => theme.primaryHover};
  }
`;

export const ErrorMessage = styled.div`
  margin-top: 0.5rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.danger};
`;

export const FormOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const RememberMe = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input {
    width: 1.1rem;
    height: 1.1rem;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 4px;
    appearance: none;
    cursor: pointer;
    position: relative;

    &:checked {
      background-color: ${({ theme }) => theme.primary};
      border-color: ${({ theme }) => theme.primaryHover};

      &::after {
        content: "";
        position: absolute;
        top: 2px;
        left: 5px;
        width: 4px;
        height: 8px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.primaryTransparent};
    }
  }

  label {
    cursor: pointer;
  }
`;

export const ForgotPassword = styled.a`
  color: ${({ theme }) => theme.primaryHover};
  text-decoration: none;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    text-decoration: underline;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    background-color: ${({ theme }) => theme.primaryHover};
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

export const AltAction = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed ${({ theme }) => theme.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const SwitchTabLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primaryHover};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    text-decoration: underline;
  }
`;

export const Terms = styled.div`
  margin-bottom: 1.5rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.muted};
  text-align: center;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.text};
`;
