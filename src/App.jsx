import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";

import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Visualizer from "./pages/Visualizer";
import CodeGenerator from "./pages/CodeGenerator";
import QueryRunner from "./pages/QueryRunner";
import Troubleshooter from "./pages/Troubleshooter";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/visualizer" element={<Visualizer />} />
          <Route path="/code" element={<CodeGenerator />} />
          <Route path="/query" element={<QueryRunner />} />
          <Route path="/errors" element={<Troubleshooter />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
