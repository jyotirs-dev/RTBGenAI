import React from "react";
import ReactDOM from "react-dom/client";

import "./styles.css";
import CrudScreen from "./features/user-crud/CrudScreen";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CrudScreen />
  </React.StrictMode>,
);
