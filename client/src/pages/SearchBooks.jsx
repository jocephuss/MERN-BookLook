import { useState, useEffect } from "react";
import { Container, Col, Form, Button, Card, Row } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import AuthService from "../utils/auth";
import { SAVE_BOOK } from "../utils/mutations";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [saveBook] = useMutation(SAVE_BOOK);

  useEffect(() => {
    // Fetch saved bookIds when the component mounts
    return () => saveBookIds(savedBookIds);
  });

  const API_KEY = "AIzaSyDpM3qDOipjXHhc8Ccu4jN_lo-2QSvV34k";
  const searchGoogleBooks = async (query) => {
    // Function to search Google Books API
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error("Something went wrong with the Google Books API");
    }
    const data = await response.json();
    return data; // Return the book data
  };

  const handleFormSubmit = async (event) => {
    // Function to handle form submission
    event.preventDefault(); // Prevent the form from submitting normally

    if (!searchInput) {
      // If the search input is empty, return early
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput); // Send the search query to the Google Books API

      const bookData = response.items.map((book) => ({
        // Map the book data to the desired format
        bookId: book.id,
        authors: book.volumeInfo.authors || ["No author to display"],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      }));

      setSearchedBooks(bookData);
      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId) => {
    // Function to save a book to the database
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId); // Find the book in the searchedBooks array

    // Ensure the user is logged in
    if (!AuthService.loggedIn()) {
      console.log("You need to be logged in to save a book!");
      return false;
    }

    try {
      const { data } = await saveBook({
        // Send book data to the mutation
        variables: { bookData: { ...bookToSave } },
      });
      console.log("Book saved, response:", data); // Log the saved book data to the console

      setSavedBookIds([...savedBookIds, bookToSave.bookId]); // Add the bookId to the savedBookIds state
    } catch (err) {
      console.error("Error saving book", err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : "Search for a book to begin"}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border="dark">
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant="top"
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className="small">Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {AuthService.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.some(
                          (savedBookId) => savedBookId === book.bookId
                        )}
                        className="btn-block btn-info"
                        onClick={() => handleSaveBook(book.bookId)}
                      >
                        {savedBookIds?.some(
                          (savedBookId) => savedBookId === book.bookId
                        )
                          ? "This book has already been saved!"
                          : "Save this Book!"}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
