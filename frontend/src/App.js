import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import AuthModal from "./components/AuthModal";
import CartDrawer from "./components/CartDrawer";
import { AuthProvider } from "./lib/AuthContext";
import { CartProvider } from "./lib/CartContext";
import { ThemeProvider } from "./lib/ThemeContext";
import CursorFollower from "./components/CursorFollower";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <CursorFollower />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
              <AuthModal />
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
