import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  Typography,
  Card,
  Space,
  Row,
  Col,
  notification,
} from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { addNewBooking } from "../store/bookingSlice";
import type { AppDispatch } from "../store";

const { Title } = Typography;
const { Option } = Select;

interface BookingFormData {
  room: "Red" | "Blue" | "Yellow";
  date: dayjs.Dayjs | null;
  startTime: dayjs.Dayjs | null;
  endTime: dayjs.Dayjs | null;
  email: string;
}

export default function BookingFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    defaultValues: {
      room: "Red",
      date: null,
      startTime: null,
      endTime: null,
      email: "",
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      if (!data.date || !data.startTime || !data.endTime) {
        notification.error({
          message: "Validation Error",
          description: "Please complete all scheduling form fields.",
        });
        return;
      }

      const startHour = data.startTime.hour();
      const startMinute = data.startTime.minute();
      const endHour = data.endTime.hour();
      const endMinute = data.endTime.minute();
      if (
        endHour < startHour ||
        (endHour === startHour && endMinute <= startMinute)
      ) {
        notification.error({
          message: "Invalid Timeframe Configuration",
          description:
            "The selected reservation End Time must be strictly after the Start Time window.",
        });
        return;
      }

      const isoStartTime = dayjs(data.date)
        .hour(startHour)
        .minute(startMinute)
        .second(0)
        .millisecond(0)
        .toISOString();

      const isoEndTime = dayjs(data.date)
        .hour(endHour)
        .minute(endMinute)
        .second(0)
        .millisecond(0)
        .toISOString();

      const submissionPayload = {
        roomName: data.room,
        bookedBy: data.email,
        startTime: isoStartTime,
        endTime: isoEndTime,
        purpose: "Workspace reservation sync",
      };

      console.log("Dispatching payload packet to backend:", submissionPayload);

      await dispatch(addNewBooking(submissionPayload)).unwrap();

      notification.success({
        message: "Booking Successful",
        description: `Successfully reserved the ${data.room} Room.`,
      });

      navigate("/");
    } catch (err: any) {
      console.error("Payload rejected by validation middleware:", err);
      notification.error({
        message: "Server Refused Request",
        description:
          err || "The backend schema rejected this timeframe calculation.",
      });
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "650px", margin: "0 auto" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/")}
        style={{
          paddingLeft: 0,
          marginBottom: "16px",
          color: "rgba(0,0,0,0.45)",
        }}
      >
        Back to Room Workspace Dashboard
      </Button>

      <Card
        title={
          <Title level={3} style={{ margin: 0 }}>
            Schedule Reservation Form
          </Title>
        }
        style={{
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form layout="vertical" component="div">
            <Form.Item
              label="Target Meeting Workspace"
              validateStatus={errors.room ? "error" : ""}
              help={errors.room?.message}
            >
              <Controller
                name="room"
                control={control}
                rules={{ required: "Please specify a space profile." }}
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    placeholder="Pick target layout context"
                  >
                    <Option value="Red">Red Room</Option>
                    <Option value="Blue">Blue Room</Option>
                    <Option value="Yellow">Yellow Room</Option>
                  </Select>
                )}
              />
            </Form.Item>

            <Form.Item
              label="Reservation Date"
              validateStatus={errors.date ? "error" : ""}
              help={errors.date?.message}
            >
              <Controller
                name="date"
                control={control}
                rules={{ required: "Calendar date context mandatory." }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    size="large"
                    style={{ width: "100%" }}
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                )}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Start Time Window"
                  validateStatus={errors.startTime ? "error" : ""}
                  help={errors.startTime?.message}
                >
                  <Controller
                    name="startTime"
                    control={control}
                    rules={{ required: "Start parameter required." }}
                    render={({ field }) => (
                      <TimePicker
                        {...field}
                        format="HH:mm"
                        size="large"
                        style={{ width: "100%" }}
                        minuteStep={15}
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="End Time Window"
                  validateStatus={errors.endTime ? "error" : ""}
                  help={errors.endTime?.message}
                >
                  <Controller
                    name="endTime"
                    control={control}
                    rules={{ required: "Termination frame context required." }}
                    render={({ field }) => (
                      <TimePicker
                        {...field}
                        format="HH:mm"
                        size="large"
                        style={{ width: "100%" }}
                        minuteStep={15}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Organizer Contact (Email Account)"
              validateStatus={errors.email ? "error" : ""}
              help={errors.email?.message}
            >
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Please supply a reference address.",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Malformed email format sequence detected.",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    type="email"
                    placeholder="example@organization.com"
                  />
                )}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: "32px", marginBottom: 0 }}>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  size="large"
                  onClick={() => navigate("/")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  loading={isSubmitting}
                  style={{ minWidth: "160px" }}
                >
                  Submit Request
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </form>
      </Card>
    </div>
  );
}
