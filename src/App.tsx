import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OrdersPage } from './pages/OrdersPage';
import { CreateOrderPage } from './pages/CreateOrderPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/create" element={<CreateOrderPage />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
