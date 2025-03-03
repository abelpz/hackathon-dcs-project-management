# Biblical Translation Project Management System

A translation project management system for biblical resources built on Door43 Content Service (DCS).

## Overview

This project is a translation project management system designed to work with Door43 Content Service (DCS), an open-source GitHub platform specifically focused on biblical and religious content translation. The system integrates with DCS's API (git.door43.org) to facilitate the management and coordination of biblical translation projects.

## Current Use Case

This system addresses a specific need: enabling Bible translation for minority language communities through strategic intermediary languages. We provide comprehensive "Book Translation Packages" that enable translators to work from a strategic language they understand (e.g., Spanish, Portuguese) to their minority language without requiring knowledge of the original biblical languages.

## Documentation

For detailed documentation on this project, please see the [documentation directory](./docs/README.md), which includes:

- [Project Overview](./docs/overview.md)
- [Book Translation Package Components](./docs/translation-package.md)
- [Translation Process](./docs/translation-process.md)
- [Workflow Visualization](./docs/workflow.md)
- [Technical Details](./docs/technical.md)
- [Detailed Milestone Documentation](./docs/milestones/README.md)

## Getting Started

[Installation and setup instructions will be added as the project develops]

## Contributing

We welcome contributions to this project. Please read our contributing guidelines [link to be added] before submitting pull requests.

## License

[License information to be determined]

---
*This project is not officially affiliated with Door43 but utilizes their open-source API for biblical content management.*

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
