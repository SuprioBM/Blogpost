import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store.js";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://f8a6da9cf29fc34c196166ad36d7d4ca@o4509090627452928.ingest.de.sentry.io/4509090631909456",
});

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StrictMode>
          <App />
        </StrictMode>
      </PersistGate>
    </Provider>
  );
} else {
  console.error(
    "❌ Root element not found. Make sure <div id='root'></div> is in index.html."
  );
}
