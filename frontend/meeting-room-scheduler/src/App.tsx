import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout, Typography } from "antd";
import HomePage from "./pages/home";
import BookingFormPage from "./pages/booking";

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
        <Header
          style={{
            background: "#001529",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#fff",
              fontSize: "18px",
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            SmartRoom Scheduler
          </div>
        </Header>

        <Content style={{ padding: "0 8px", marginTop: "24px" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<BookingFormPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  );
}
