import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Home, Contact } from "lucide-react";
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Page1 } from "./page1/Page1";
import { Page2 } from "./page2/Page2";


function App() {
return (
    <Routes>
      <Route path="/" element={<Page1 />} />
      <Route path="/2" element={<Page2 />} />

    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  </StrictMode>
  </BrowserRouter>
);
