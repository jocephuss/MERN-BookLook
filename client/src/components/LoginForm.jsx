import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";
import AuthService from "../utils/auth";

const LoginForm = () => {
  // LoginForm component
  const [userFormData, setUserFormData] = useState({ email: "", password: "" }); // State variable for storing user form data
  const [validated] = useState(false); // State variable for showing alert
  const [showAlert, setShowAlert] = useState(false);

  // Use the LOGIN_USER mutation
  const [loginUser, { error }] = useMutation(LOGIN_USER); // GraphQL mutation for login

  const handleInputChange = (event) => {
    // Handle form input change event
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value }); // Update the userFormData state with the input values
  };

  const handleFormSubmit = async (event) => {
    // Handle form submission event
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      // Check if form has everything (as per react-bootstrap docs)
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      // Call the LOGIN_USER mutation
      const { data } = await loginUser({
        // Pass the userFormData as input to the mutation
        variables: { ...userFormData },
      });

      AuthService.login(data.login.token); // Login the user with the token
    } catch (err) {
      // If there's an error, display an error message and reset the form
      console.error(err);
      setShowAlert(true);
    }

    setUserFormData({
      // Clear the userFormData state and reset the form
      email: "",
      password: "",
    });
  };

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert
          dismissible
          onClose={() => setShowAlert(false)}
          show={showAlert || !!error}
          variant="danger"
        >
          Something went wrong with your login credentials!
        </Alert>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email</Form.Label>
          <Form.Control
            type="text"
            placeholder="Your email"
            name="email"
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type="invalid">
            Email is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="password">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Your password"
            name="password"
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type="invalid">
            Password is required!
          </Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type="submit"
          variant="success"
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
