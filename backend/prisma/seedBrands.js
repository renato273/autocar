"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const popularBrands = [
    "Toyota", "Honda", "Ford", "Chevrolet", "Nissan",
    "Volkswagen", "Hyundai", "Kia", "BMW", "Mercedes-Benz",
    "Audi", "Tesla", "Mazda", "Subaru", "Jeep",
    "Lexus", "Volvo", "Porsche", "Fiat", "Peugeot", "Renault"
];
async function main() {
    console.log("Seeding brands...");
    for (const name of popularBrands) {
        await prisma.brand.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log("Brands seeded successfully!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
