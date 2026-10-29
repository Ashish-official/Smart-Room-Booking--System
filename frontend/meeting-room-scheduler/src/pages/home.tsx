import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Table, Typography, Space, Card, Row, Col, Alert } from "antd";
import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import { fetchBookings, setRoom, setPage } from "../store/bookingSlice";
import type { RootState, AppDispatch } from "../store/index";
import type { ColumnsType } from "antd/es/table";
import type { Booking } from "../types/boking";

const { Title, Text } = Typography;

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    selectedRoom,
    bookings,
    totalCount,
    currentPage,
    pageSize,
    isLoading,
  } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    dispatch(
      fetchBookings({ room: selectedRoom, page: currentPage, limit: pageSize }),
    );
  }, [dispatch, selectedRoom, currentPage, pageSize]);

  const handleRoomChange = (room: "Red" | "Blue" | "Yellow") => {
    dispatch(setRoom(room));
  };

  const handleTableChange = (pagination: any) => {
    if (pagination.current) {
      dispatch(setPage(pagination.current));
    }
  };

  const columns: ColumnsType<Booking> = [
    {
      title: "Booking ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: "Reserved Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Timeline Window",
      key: "timeWindow",
      render: (_, record) => (
        <Text strong>
          {record.startTime} - {record.endTime}
        </Text>
      ),
    },
    {
      title: "Organizer Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <a href={`mailto:${email}`}>{email}</a>,
    },
  ];

  // Map colors for button selections dynamically
  const roomColors = {
    Red: { color: "#ff4d4f" },
    Blue: { color: "#1890ff" },
    Yellow: { color: "#fadb14" },
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header Banner */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "32px" }}
      >
        <Col xs={24} sm={16}>
          <Title level={2}>
            <CalendarOutlined style={{ marginRight: "8px" }} /> Smart Meeting
            Room Workspace
          </Title>
          <Text type="secondary">
            Select a resource profile below to access real-time schedule slots.
          </Text>
        </Col>
        <Col xs={24} sm={8} style={{ textAlign: "right", marginTop: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate("/book")}
            style={{ borderRadius: "6px" }}
          >
            Create New Booking
          </Button>
        </Col>
      </Row>
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Text strong style={{ display: "block", marginBottom: "16px" }}>
          Filter Schedules by Resource Type:
        </Text>
        <Space size="middle" wrap style={{ width: "100%" }}>
          {(["Red", "Blue", "Yellow"] as const).map((room) => {
            const isActive = selectedRoom === room;
            return (
              <Button
                key={room}
                size="large"
                onClick={() => handleRoomChange(room)}
                style={{
                  minWidth: "140px",
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? roomColors[room].color : "#fff",
                  color: isActive
                    ? room === "Yellow"
                      ? "#000"
                      : "#fff"
                    : "rgba(0,0,0,0.85)",
                  borderColor: roomColors[room].color,
                  boxShadow: isActive ? "0 4px 10px rgba(0,0,0,0.15)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {room} Room
              </Button>
            );
          })}
        </Space>
      </Card>

      <Card
        title={`Active Reservation Log: ${selectedRoom} Room`}
        style={{ borderRadius: "8px" }}
      >
        {bookings.length === 0 && !isLoading ? (
          <Alert
            message={`No current schedules mapped for the ${selectedRoom} Room.`}
            description="Use the button above to reserve this workspace profile."
            type="info"
            showIcon
          />
        ) : (
          <Table
            dataSource={bookings}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            onChange={handleTableChange}
            scroll={{ x: true }} 
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: false,
              position: ["bottomCenter"],
            }}
          />
        )}
      </Card>
    </div>
  );
}
