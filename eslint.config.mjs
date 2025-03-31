import { defineConfig, globalIgnores } from "eslint/config"
import prettier from "eslint-plugin-prettier"
import globals from "globals"
import path from "node:path"
import { fileURLToPath } from "node:url"
import js from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  globalIgnores([".next/*", "out/*"]),
  {
    extends: compat.extends(
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:prettier/recommended",
      "prettier",
      "next",
    ),

    plugins: {
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },

      ecmaVersion: 2018,
      sourceType: "module",
    },

    settings: {
      react: {
        version: "17.0.2",
      },
    },

    rules: {
      "prettier/prettier": "error",
      "no-irregular-whitespace": 0,
      "no-param-reassign": "off",

      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "next",
        },
      ],

      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "no-undef": "off",
    },
  },
])
