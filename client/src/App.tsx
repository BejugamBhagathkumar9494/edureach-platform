import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Navbar from "./components/Navbar";
import FloatingChatButton from "./components/FloatingChatButton";
import CallPopup from "./components/CallPopup";

const WithNavbar = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
  </>
);

export default function App() {
  const [showCallPopup, setShowCallPopup] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route
            path="/"
            element={
              <WithNavbar>
                <HomePage onOpenCall={() => setShowCallPopup(true)} />
              </WithNavbar>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
        <FloatingChatButton onOpenCall={() => setShowCallPopup(true)} />
        <CallPopup open={showCallPopup} onClose={() => setShowCallPopup(false)} />
      </AuthProvider>
    </BrowserRouter>
  );
}