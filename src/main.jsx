import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";

import { ToastProvider } from "./Components/ToastProvider"; // <-- ADD THIS
import { ThemeProvider } from "./theme/ThemeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <BrowserRouter>
      {/* Wrap App with ToastProvider */}
      <ThemeProvider>
        <ToastProvider position="top-right">
          <App />
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);
