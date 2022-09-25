import React, { useState} from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';

//import useMutation, useQuery from Apollo
import { useMutation, useQuery } from '@apollo/client';
//import GET_ME query from queries.js
import { GET_ME } from '../utils/queries';
//import REMOVE_BOOK mutation
import { REMOVE_BOOK } from '../utils/mutations';

import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
 
  // replace useEffect() with useQuery() to trigger GET_ME query and retrieve user data
  const { data: userData , loading } = useQuery(GET_ME);

  const [removeBook, { error }] = useMutation(REMOVE_BOOK);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
  
    try {
     
      //call REMOVE_BOOK mutation, passing in the bookId as the variable
      await removeBook({
        variables: {
          bookId: bookId
        }
      })

      // setUserData(updatedUser);
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (!userData) {
    return <h2>LOADING...</h2>;
  }
  
  console.log('savedBooks', userData.me.savedBooks)

 return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.me.savedBooks.length
            ? `Viewing ${userData.me.savedBooks.length} saved ${userData.me.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.me.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
