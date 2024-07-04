import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // const user = await prisma.user.create({
  //   data: {
  //     username: 'johndoe',
  //     email: '4VW9E@example.com',
  //     password: 'secret123',
  //   },
  // })
  // console.log(user)

  const book = await prisma.book.create({
    data: {
      title: 'The Lord of the Rings',
      author: 'J.R.R. Tolkien',
      publishedYear: 1954,
    },
  })
  console.log(book)
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