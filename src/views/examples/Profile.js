import { useState, useEffect } from "react";
import { updateUser } from "helper/userManagment_helper";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  Button,
} from "reactstrap";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    empid: "",
    name: "",
    email: "",
    pwd: "",
    cont: "",
    role: "",
  });

  const isFormValid =
    data.name.trim() !== "" &&
    data.email.trim() !== "" &&
    data.pwd.trim() !== "" &&
    data.cont.trim() !== "" &&
    data.role.trim() !== "";

  // Load user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userData");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      setData((prev) => ({
        ...prev,
        empid: parsedUser.empid || "",
        role: parsedUser.role || "",
      }));
    }

    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded);

      setData((prev) => ({
        ...prev,
        name: decoded.unique_name || "",
        email: decoded.email || "",
        cont: decoded.Contact || "",
      }));
    }
  }, []);

  // Handle change
  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // Update handler with toast
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUser(data);

      toast.success("Profile updated successfully!", {
        position: "top-right",
      });
    } catch (err) {
      toast.error("Failed to update profile!", {
        position: "top-right",
      });
    }

    setLoading(false);
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center min-vh-100"
    >
      <ToastContainer />

      <Row className="w-100 justify-content-center">
        <Col lg="6" md="8">
          <Card className="shadow">
            <CardBody>
              <h3 className="text-center mb-4">Update Profile</h3>

              <Form onSubmit={handleUpdate}>
                <Input type="hidden" name="empid" value={data.empid} />

                <FormGroup>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    disabled
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    name="pwd"
                    value={data.pwd}
                    onChange={handleChange}
                    placeholder="Enter new password"
                  />
                </FormGroup>

                {/* <FormGroup>
              <Label>Contact Number</Label>
              <Input
                type="text"
                name="cont"
                value={data.cont}
                onChange={handleChange}
              />
            </FormGroup> */}

                <FormGroup>
                  <Label>Contact Number</Label>

                  <PhoneInput
                  inputClassName="w-100"
                    defaultCountry="in" // India by default 🇮🇳
                    value={data.cont}
                    onChange={(phone) =>
                      setData((prev) => ({
                        ...prev,
                        cont: phone,
                      }))
                    }
                  />
                </FormGroup>

                <FormGroup>
              <Label>Role</Label>
              <Input
                type="select"
                disabled
                name="role"
                value={data.role}
                onChange={handleChange}
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="operator">Operator</option>
              </Input>
            </FormGroup>

                <Button
                  color="primary"
                  block
                  disabled={loading || !isFormValid}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
