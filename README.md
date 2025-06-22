# Jupymate Navigator

**A developer's compass for the Jupiverse. Explore APIs, visualize swaps, and get AI-powered insights for building on Jupiter.**

---

## Introduction

Jupymate Navigator is an advanced developer tool designed to simplify and accelerate the development process on the Solana blockchain, with a specific focus on the Jupiter ecosystem. It provides a comprehensive suite of features, including a real-time cross-token swap visualizer, an AI-powered portfolio analyzer, and interactive documentation for the Jupiter API, all presented in a polished, visually-driven interface with dynamic gradients and layouts. Whether you're a seasoned Solana developer or just starting out, Jupymate Navigator is your essential companion for building robust and efficient DeFi applications.

## Key Features

-   **Cross-Token Swap Visualizer**: Input any two tokens on Solana and get a real-time quote, rich cost-breakdown charts, and route visualization from the Jupiter API. Execute swaps directly through your connected wallet.
-   **AI-Powered Portfolio Analyzer**: Connect your wallet to get an AI-generated "vibe check" of your token holdings, classifying your portfolio as 'Degen', 'Normie', or 'Investor' with witty reasoning. Includes token safety validation based on Jupiter's token lists.
-   **AI Developer Assistant**: An interactive chatbot trained on the Jupiter API configuration. Ask questions in natural language (e.g., "How do I get a quote for a swap?") and get instant, context-aware answers and code snippets.
-   **Interactive API Config**: Explore the complete Jupiter Master Control Program (MCP) JSON configuration. Hover over any key to get an AI-generated tooltip explaining its purpose and usage.
-   **Polished UI/UX**: Features a modern, responsive design with dynamic gradients and a carefully aligned layout, built with Tailwind CSS and ShadCN UI.
-   **Governance & Ecosystem Insights**: Quick access to essential community resources, including governance analytics dashboards and developer documentation.
-   **Unified Wallet Support**: Seamlessly connect with popular Solana wallets like Phantom, Solflare, and Backpack.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Generative AI**: [Google AI & Genkit](https://firebase.google.com/docs/genkit)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Solana Integration**: [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

---

## Getting Started

Follow these instructions to get a local copy of Jupymate Navigator up and running on your machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/sathwik-70/Jupymate.git
    cd Jupymate
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

### Environment Setup

The application uses Google's Gemini model for its AI features. You will need a Gemini API key to run the application.

1.  **Create a `.env` file** in the root of your project.

2.  **Add your Gemini API key** to the `.env` file:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```
    You can obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Development Server

Once the dependencies are installed and the environment is configured, you can start the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will automatically reload if you make any changes to the source files.

---

## Project Workflow & Structure

The project follows a standard Next.js App Router structure, with a focus on component-based architecture and server-side rendering.

-   `src/app/`: Contains the main pages and layout of the application.
-   `src/components/`: Houses all the reusable React components.
    -   `src/components/features/`: High-level components that represent a specific feature of the app (e.g., `CrossTokenSwap`, `PortfolioAnalyzer`).
    -   `src/components/ui/`: Low-level, reusable UI elements from ShadCN (e.g., `Button`, `Card`).
    -   `src/components/shared/`: Components shared across multiple features.
-   `src/ai/`: Contains all the Genkit AI integration logic.
    -   `src/ai/flows/`: Defines the core AI workflows (e.g., `portfolio-analyzer.ts`). These are server-side functions that interact with the Gemini model.
    -   `src/ai/genkit.ts`: Configures and initializes the Genkit framework.
-   `src/config/`: Stores static configuration files, such as the token list (`tokens.ts`) and the Jupiter API config (`mcpConfig.json`).

## Deployment

This Next.js application is optimized for deployment on modern Jamstack platforms like Vercel and Netlify.

### A Note on GitHub Pages

While GitHub Pages is excellent for static sites, it is **not recommended** for this application. Jupymate Navigator relies on server-side AI features (Genkit flows) that require a Node.js environment to run. GitHub Pages does not support this, and deploying there would cause the AI features to fail.

### Deploying with Vercel (Recommended)

Vercel is the creator of Next.js and provides a seamless deployment experience.

1.  Push your code to a GitHub, GitLab, or Bitbucket repository.
2.  Sign up for a [Vercel](https://vercel.com/) account and connect your Git provider.
3.  Import your project repository into Vercel. It will be automatically detected as a Next.js app.
4.  **Configure Environment Variables**: In the Vercel project settings, navigate to the "Environment Variables" section and add your `GEMINI_API_KEY`.
5.  Click "Deploy". Vercel will build and deploy your application, providing you with a live URL.

### Deploying with Netlify

Netlify is another excellent platform for deploying modern web applications.

1.  Push your code to a GitHub, GitLab, or Bitbucket repository.
2.  Sign up for a [Netlify](https://www.netlify.com/) account and connect your Git provider.
3.  Click "Add new site" -> "Import an existing project".
4.  Select your repository.
5.  Netlify should automatically detect your build settings. The build command is `next build` and the publish directory is `.next`.
6.  **Configure Environment Variables**: Before deploying, go to your site's dashboard and navigate to "Site configuration" -> "Build & deploy" -> "Environment variables". Add your `GEMINI_API_KEY` here.
7.  Click "Deploy site". Netlify will build and deploy your application.

---

## License

This project is distributed under the Open Source License.
# jupymate
# jupymate
# jupymate
