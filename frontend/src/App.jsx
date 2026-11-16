import { useAuth } from "./context/AuthContext";
import PageLoader from "./components/PageLoader";
import Layout from "./components/Layout";
import { Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import CheckoutReturnPage from "./pages/CheckoutReturnPage";
import ProductDetailPage from "./pages/ProductDetailPage";

import OrderDetailPage from "./pages/OrderDetailPage";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import OrderChatPage from "./pages/OrderChatPage";
import OrderVideoPage from "./pages/OrderVideoPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  const { isLoaded, isSignedIn, user } = useAuth();

  if (!isLoaded) return <PageLoader />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route
          path="/orders"
          element={isSignedIn ? <OrdersPage /> : <Navigate to={"/"} replace />}
        />
        <Route path="/checkout/return" element={<CheckoutReturnPage />} />


        <Route
          path="/orders/:id/call"
          element={isSignedIn ? <OrderVideoPage /> : <Navigate to={"/"} replace />}
        />

        <Route
          path="/admin"
          element={isSignedIn && user?.role === "admin" ? <AdminProductsPage /> : <Navigate to="/" replace />}
        />

        {/* NESTED ROUTES */}
        <Route path="/orders/:id" element={<OrderDetailPage />}>
          <Route index element={<OrderSummaryPage />} />
          <Route path="chat" element={<OrderChatPage />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default App;
