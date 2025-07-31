// client/src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/index";
import App from "./App";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallbackPage from "./component/ErrorFallbackPage";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary FallbackComponent={ErrorFallbackPage}>
        <App />
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);
