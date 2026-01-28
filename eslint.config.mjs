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
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
      "prefer-const": "warn",
      "jsx-a11y/heading-has-content": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-redeclare": "warn",
      // Enforce camelCase naming convention for properties (prevents snake_case like full_name, daily_rate)
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "property",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          // Allow quoted properties for external API responses
          filter: {
            regex: "^[a-z]+_[a-z]+",
            match: false
          }
        },
        {
          selector: "typeProperty",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow"
        }
      ]
    }
  }
];

export default eslintConfig;
