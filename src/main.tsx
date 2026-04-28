import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react"; // React is needed for JSX

if (window.location.hostname === "estatenest.capital") {
  const canonicalUrl =
    "https://www.estatenest.capital" +
    window.location.pathname +
    window.location.search +
    window.location.hash;

  window.location.replace(canonicalUrl);
}

// Create a client for React Query
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
