import React from "react";
import ReactDOM from "react-dom/client";

import CrudScreen from "./features/user-crud/CrudScreen";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CrudScreen />
  </React.StrictMode>,
);
