
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";
import PackagesPage from "./pages/PackagesPage";
import PackageDetailsPage from "./pages/PackageDetailsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  return (
  <Routes>
  <Route element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/gallery" element={<GalleryPage />} />
    <Route path="/packages" element={<PackagesPage />} />
    <Route path="/packages/:id" element={<PackageDetailsPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/book/:packageId" element={<BookingPage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
);
}

export default App
