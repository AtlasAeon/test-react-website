module.exports = {
  env: {
    node: true,
    jest: true,
  },
  globals: {
    fetch: false,
    Response: false,
  },
  // Specifies the ESLint parser
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // Allows for the parsing of modern ECMAScript features
    ecmaVersion: 2019,
    // Allows for the use of imports
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
      // Allows for the parsing of JSX
      jsx: true,
    },
    // project: './tsconfig.json',
    // tsconfigRootDir: '.',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier', 'import', 'jsx-a11y'],
  extends: [
    'airbnb',
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    // Uses the recommended rules from @eslint-plugin-react
    'plugin:react/recommended',
    // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended',
    'prettier',
    // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    'no-console': 'off',
    'no-unused-expressions': [
      // warn but don't fire rule on expressions inside of short circuted or ternary expressions
      'warn',
      {
        // e.g. () => { something conditionally true } || () => { something else condtionally true }
        allowShortCircuit: true,
        // e.g. something conditionally true ? () = > { do something } : () => { do something else }
        allowTernary: true,
      },
    ],
    // warn against functionally useless interface.
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        // if true, only functions which are part of a declaration will be checked
        allowExpressions: true,
        // if true, type annotations are also allowed on the variable of a function expression rather than on the function directly
        allowTypedFunctionExpressions: true,
        // if true, functions immediately returning another function expression will not be checked
        allowHigherOrderFunctions: true,
      },
    ],
    'react/display-name': ['warn', { ignoreTranspilerName: false }],
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'import/prefer-default-export': 'off',
    'react/no-unescaped-entities': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: ['./src', __dirname],
        // Add exceptions for dev or test only scripts
        devDependencies: [
          '**/*.{test,spec}.{js,jsx,ts,tsx}',
          '**/__mocks__/**',
          '**/config/*.js',
          '**/scripts/**/*.js',
        ],
      },
    ],
  },
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        // Tell Import that valid directories to look for modules is in the root directory. (Supports using "src/my.component")
        moduleDirectory: ['node_modules', './'],
      },
    },
    react: {
      // Tells eslint-plugin-react to automatically detect the version of React to use
      version: 'detect',
    },
  },
};
