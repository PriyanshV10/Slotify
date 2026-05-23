const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.eventType.findMany();
  console.log(events.map(e => ({ title: e.title, showOnProfile: e.showOnProfile })));
}
main();
