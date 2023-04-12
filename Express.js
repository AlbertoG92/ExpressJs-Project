const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
app.use(bodyParser.json());
app.use(express.json());

// Mock data for books
const books = [
  {
    title: "The Hitchhiker's Guide to the Galaxy",
    author: "Douglas Adams",
    isbn: "9780345391803",
    reviews: []
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    reviews: []
  },
  {
    title: 'Il Signore degli Anelli',
    author: 'J.R.R. Tolkien',
    isbn: '1234567890',
    reviews: []
  }
];

// Route to get all books
app.get('/books', (req, res) => {
  res.json(books);
});

// Route to get book by ISBN
//app.get('/books/:isbn', (req, res) => {
  //const isbn = req.params.isbn;
  //const book = books.find(book => book.isbn === isbn);

  //if (!book) {
  // return res.status(404).json({ message: 'Book not found' });
  //}
  //res.json(book);
//});

// Test this endpoint in Postman http://localhost:3000/books/1234567890
app.get('/books/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find(book => book.isbn === isbn);
  if (book) {
    res.json(book);
  } else {
    res.status(404).send('Book not found');
  }
});


// OK in Postman testo endpoint con il seguente url http://localhost:3000/books/author/J.R.R. Tolkien
// Route to get all books by author
app.get('/books/author/:author', (req, res) => {
  const author = req.params.author;
  const booksByAuthor = books.filter(book => book.author === author);
  if (!booksByAuthor.length) {
    return res.status(404).json({ message: 'Books not found for author' });
  }
  res.json(booksByAuthor);
});

// http://localhost:3000/books/title/1984/
// Route to get all books by title
app.get('/books/title/:title', (req, res) => {
  const title = req.params.title;
  const booksByTitle = books.filter(book => book.title === title);
  if (!booksByTitle.length) {
    return res.status(404).json({ message: 'Books not found for title' });
  }
  res.json(booksByTitle);
});

//  test endpoint con Postman 
// Route to get book reviews by ISBN http://localhost:3000/books/9780345391803/reviews
app.get('/books/:isbn/reviews', (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find(book => book.isbn === isbn);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json(book.reviews);
});


// http://localhost:3000/register post request in Postman
// Route to register new user
const users = [];

//app.post('/register', (req, res) => {
 // const { username, password } = req.body;
 // const name = req.body.name;
 // const user = { username, password, name };
 // users.push(user);
 // fs.writeFileSync('./users.json', JSON.stringify(users));
 // res.send('User registered successfully!');
//});

app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Scrivi l'utente su un file
  fs.appendFileSync('users.txt', `${username},${password}\n`);

  res.send('Utente registrato con successo!');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Leggi il file degli utenti
  //const users = fs.readFileSync('users.txt', 'utf8').split('\n');

  // Cerca l'utente con le credenziali fornite
  let authenticated = false;
  for (let i = 0; i < users.length; i++) {
    const [savedUsername, savedPassword] = users[i].split(',');
    if (username === savedUsername && password === savedPassword) {
      authenticated = true;
      break;
    }
  }

  if (authenticated) {
    res.send('Login effettuato con successo!');
  } else {
    res.status(401).send('Credenziali non valide');
  }



//app.post('/login', (req, res) => {
 // const { username, password, name } = req.body;
 // const user = users.find((user) => user.username === username && user.password === password  && user.name === name);
 // if (user) {
  //  res.send('Login successful!');
  //} else {
   // res.status(401).send('Invalid credentials');
 // }
//});


// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});


// Route to add a book review for a user
app.post('/books/:isbn/reviews', (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find(book => book.isbn === isbn);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  // assuming user is authenticated and user ID is available in req.user.id
  const userReview = req.body.review;
  book.reviews.push({
    userId: req.user.id,
    review: userReview
  });
  res.json({ message: 'Review added successfully' });
});

// Route to modify a book review added by a user
app.put('/books/:isbn/reviews/:reviewId', (req, res) => {
  const isbn = req.params.isbn;
  const reviewId = req.params.reviewId;
  const book = books.find(book => book.isbn === isbn);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  // assuming user is authenticated and user ID is available in req.user.id
  const userReview = req.body.review;
  const reviewIndex = book.reviews.findIndex(review => review.id === reviewId && review.userId === req.user.id);
  if (reviewIndex === -1) {
    return res.status(404).json({ message: 'Review not found' });
  }
  book.reviews[reviewIndex].review = userReview;
  res.json({ message: 'Review modified successfully' });
});

// Route to delete a book review added by a user
app.delete('/books/:isbn/reviews/:reviewId', (req, res) => {
  const isbn = req.params.isbn;
  const reviewId = req.params.reviewId;
  const book = books.find(book => book.isbn === isbn);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  // assuming user is authenticated and user ID is available in req.user.id
  const reviewIndex = book.reviews.findIndex(review => review.id === reviewId && review.userId === req.user.id);
  if (reviewIndex === -1) {
    return res.status(404).json({ message: 'Review not found' });
  }
  book.reviews.splice(reviewIndex, 1);
  res.json({ message: 'Review deleted successfully' });
});



const axios = require('axios');

// Method 1: Get all books using async/await
async function getAllBooks() {
  try {
    const response = await axios.get('https://example.com/books');
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// Method 2: Search by ISBN using Promises
function searchByISBN(isbn) {
  return axios.get(`https://example.com/books?isbn=${isbn}`)
    .then(response => response.data)
    .catch(error => console.error(error));
}

// Method 3: Search by Author using async/await
async function searchByAuthor(author) {
  try {
    const response = await axios.get(`https://example.com/books?author=${author}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// Method 4: Search by Title using Promises
function searchByTitle(title) {
  return axios.get(`https://example.com/books?title=${title}`)
    .then(response => response.data)
    .catch(error => console.error(error));
}

// Example usage
(async () => {
  const allBooks = await getAllBooks();
  console.log('All books:', allBooks);

  const isbnSearchResult = await searchByISBN('1234567890');
  console.log('Search by ISBN:', isbnSearchResult);

  const authorSearchResult = await searchByAuthor('J.K. Rowling');
  console.log('Search by Author:', authorSearchResult);

  const titleSearchResult = await searchByTitle('Harry Potter');
  console.log('Search by Title:', titleSearchResult);
})();
