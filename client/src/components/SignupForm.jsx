import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import { ADD_USER } from "../utils/mutations";
import Auth from "../utils/auth";

const SignupForm = () => {
  // SignupForm component
  const [userFormData, setUserFormData] = useState({
    username: "",
    email: "",
    password: "",
  }); // State variable for storing user form data
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // State variable for showing alert

  // Use the ADD_USER mutation
  const [addUser, { error }] = useMutation(ADD_USER);

  const handleInputChange = (event) => {
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
      // Call the ADD_USER mutation
      const { data } = await addUser({
        // Pass the userFormData as input to the mutation });
        variables: { ...userFormData },
      });

      Auth.login(data.addUser.token); // Login the user with the token
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    setUserFormData({
      // Clear the userFormData state and reset the form
      username: "",
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
          Something went wrong with your signup!
        </Alert>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="username">Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Your username"
            name="username"
            onChange={handleInputChange}
            value={userFormData.username}
            required
          />
          <Form.Control.Feedback type="invalid">
            Username is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Your email address"
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
          disabled={
            !(
              userFormData.username &&
              userFormData.email &&
              userFormData.password
            )
          }
          type="submit"
          variant="success"
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;
