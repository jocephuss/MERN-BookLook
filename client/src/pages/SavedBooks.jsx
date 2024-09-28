import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import AuthService from "../utils/auth";
import { removeBookId } from "../utils/localStorage";

const SavedBooks = () => {
  // Use Apollo's useQuery to get the logged-in user's data
  const { loading, data } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK); // GraphQL mutation for removing a book

  // If there's data, use it, otherwise use an empty object
  const userData = data?.me || {}; // Initial state for userData
  const savedBooks = userData.savedBooks || []; // Ensure savedBooks is always an array to prevent undefined errors

  // If loading, show a loading message
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  // Create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    // Function to delete a book
    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // Use the removeBook mutation instead of the deleteBook API call
      const { data } = await removeBook({
        // Send bookId to the mutation
        variables: { bookId }, // Send bookId to the mutation
      });

      // Update local state with the user's new data
      removeBookId(bookId); // Remove the bookId from localStorage
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Header section */}

      <Container fluid className="text-light bg-dark p-5">
        <h1>Viewing saved books!</h1>
      </Container>

      {/* Books display section */}
      <Container>
        <h2 className="pt-5">
          {/* Check if there are any saved books and display the appropriate message */}
          {savedBooks.length
            ? `Viewing ${savedBooks.length} saved ${
                savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>

        <Row>
          {/* Iterate over savedBooks array and display each book */}
          {savedBooks.map((book) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {/* Display the book's cover image if it exists */}
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  {/* Display the book's title, authors, and description */}
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>

                  {/* Button to delete the book, triggers handleDeleteBook function */}
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)} // Call the handleDeleteBook function with the bookId
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
