import { PrismaClient } from '.prisma/client';

const prisma = new PrismaClient();

const userData = [
  {
    username: 'Nice',
    password: 'mnbdshi3',
    email: 'nice@gmial.com',
    books: {
      create: [
        {
          title: 'How to be golang developer',
          page: 105,
          description: '-',
          published: true,
        },
        {
          title: 'How to be rust developer',
          page: 135,
          description: 'Rust is coming to beat golang and nodejs',
        },
      ],
    },
  },
  {
    username: 'Petch',
    password: 'k3d9u7i4',
    email: 'petch@gmail.com',
    books: {
      create: [
        {
          title: 'How to be nodejs developer',
          page: 150,
          description: '-',
          published: true,
        },
        {
          title: 'How to be the best of husband',
          page: 550,
          description:
            'Method and Mindset to be the best of husband in the world',
        },
      ],
    },
  },
];

async function main() {
  console.log('Start seeding ...');
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
