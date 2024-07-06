import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed your database here after prisma migration
await prisma.user.createMany({
    data: [
      { username: 'johndoe1', email: 'johndoe1@example.com', password: 'secret123' },
      { username: 'johndoe2', email: 'johndoe2@example.com', password: 'secret123' },
      { username: 'johndoe3', email: 'johndoe3@example.com', password: 'secret123' },
    ],
  })

  await prisma.book.createMany({
    data: [
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', publishedYear: 1937 },
      { title: 'The Catcher in the Rye', author: 'J.D. Salinger', publishedYear: 1951 },
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', publishedYear: 1960 },
      { title: '1984', author: 'George Orwell', publishedYear: 1949 },
      { title: 'Pride and Prejudice', author: 'Jane Austen', publishedYear: 1813 },
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publishedYear: 1925 },
      { title: 'The Grapes of Wrath', author: 'John Steinbeck', publishedYear: 1939 },
      { title: 'The Alchemist', author: 'Paulo Coelho', publishedYear: 1988 },
      { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', publishedYear: 1954 },
      { title: 'Treasure Island', author: 'Robert Louis Stevenson', publishedYear: 1883 },
      { title: 'Animal Farm', author: 'George Orwell', publishedYear: 1945 },
      { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', publishedYear: 1890 }
    ],
  })

  //Review seeding can fail if the tables had previously deleted data
  await prisma.review.createMany({
    data: [
      { bookId: 1, userId: 1, comment: 'Great read!', rating: 5 },
      { bookId: 2, userId: 2, comment: 'I really enjoyed the book', rating: 4 },
      { bookId: 3, userId: 3, comment: 'Great book!', rating: 5 },
      { bookId: 4, userId: 1, comment: 'I really enjoyed the book', rating: 4 },
      { bookId: 5, userId: 2, comment: 'Great book!', rating: 5 },
      { bookId: 6, userId: 3, comment: 'I really enjoyed the book', rating: 4 },
      { bookId: 7, userId: 1, comment: 'Great book!', rating: 5 },
      { bookId: 8, userId: 2, comment: 'I really enjoyed the book', rating: 4 },
      { bookId: 9, userId: 3, comment: 'Great book!', rating: 5 },
      { bookId: 10, userId: 1, comment: 'I really enjoyed the book', rating: 4 },
      { bookId: 11, userId: 2, comment: 'Great book!', rating: 5 },
      { bookId: 12, userId: 3, comment: 'I really enjoyed the book', rating: 4 },
    ],
  })
  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })