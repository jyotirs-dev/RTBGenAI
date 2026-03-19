import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";

import { LoadingScreen } from "./LoadingScreen";
import "./styles.css";

const crudScreenModule = import("./features/user-crud/CrudScreen");
const CrudScreen = lazy(() => crudScreenModule);

void crudScreenModule;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingScreen />}>
      <CrudScreen />
    </Suspense>
  </React.StrictMode>,
);
