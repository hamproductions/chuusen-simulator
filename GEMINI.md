# Project Overview

This is a template for building React applications with Vite, TypeScript, and Panda CSS. It includes features like file-based routing with Vike, internationalization with i18next, and a component library from Park UI.

**Key Technologies:**

*   **Framework:** React
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** Panda CSS, Park UI
*   **Routing:** Vike
*   **Internationalization:** i18next

# Building and Running

*   **Install dependencies:**
    ```bash
    bun install
    ```

*   **Start the development server:**
    ```bash
    bun dev
    ```

*   **Build for production:**
    ```bash
    bun build
    ```

*   **Run tests:**
    ```bash
    bun test
    ```

# Development Conventions

*   **Code Style:** The project uses ESLint and Prettier for code quality and consistent formatting.
*   **Component Library:** The project uses Park UI for its component library.
*   **Styling:** Styling is handled by Panda CSS.
*   **Routing:** File-based routing is managed by Vike. The page structure is defined in the `src/pages` directory.
*   **State Management:** There is no explicit state management library installed, so it is likely that component state or React Context is used for managing state.

# Agent's Knowledge Base

This section summarizes the key aspects of the project and user preferences, and will be consistently updated by the agent.

## Project Setup & Conventions:

*   **Framework:** React
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** Panda CSS, Park UI
*   **Routing:** Vike (file-based routing in `src/pages`)
*   **Internationalization:** i18next
*   **State Management:** Component state or React Context (no explicit library).
*   **Code Style:** ESLint and Prettier for quality and formatting.

## Specific Implementations:

### Lottery Simulator:

*   **Inputs:** Total Ballots Sold, Number of Winners, Average Ballots per Person, Log-normal Distribution Mean (μ), Log-normal Distribution Standard Deviation (σ), Number of Channels, Number of Simulation Runs.
*   **Ballot Distribution:** Modeled using a log-normal distribution. The total ballot pool is precisely adjusted to `totalBallots` after generation.
*   **"Win Once" Rule:** A person can only win once per simulation run.
*   **Outputs:** Probability of Winning, Winner Profile (distribution graph), Ballots per Winner (avg, median, mode), Channel Analysis (placeholder).
*   **UI:** Built with Park UI components. Input values are persisted using `useLocalStorage`.
*   **Visualizations:** `recharts` library is used for charting.
    *   Winner Profile: Bar chart.
    *   Winning Probability: Bar chart.
    *   Log-normal Distribution: Line chart (updates in real-time with input changes).
*   **Simulation Trigger:** Main simulation results update on "Run Simulation" button click. Only the Log-normal Distribution chart updates in real-time with input changes.

## User Preferences:

*   **Code Style:** Concise, self-explanatory, and maintainable code. No comments in code.
*   **Conventions:** Strict adherence to existing project conventions (coding style, structure, framework choices, typing, architectural patterns).
*   **Imports:** Prefer named imports for component namespaces (e.g., `import { Field } from '~/components/ui/field'`) instead of star imports (`import * as Field from '~/components/ui/field'`).
*   **Diffs:** When outputting diffs, always double-check for correctness.

## Agent's Operational Clause:

This knowledge base will be consistently updated by the agent to reflect new learnings, project changes, and evolving user preferences. The agent will refer to this document to ensure adherence to project standards and to provide efficient, personalized assistance.