import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // 🚫 TypeScript'te `any` kullanımına izin ver
      "@typescript-eslint/no-explicit-any": "off",

      // 🚫 React'ta `key` prop zorunluluğunu kapat
      "react/jsx-key": "off",
    },
  },
];

export default eslintConfig;
