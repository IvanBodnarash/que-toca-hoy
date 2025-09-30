"use strict";

module.exports = {
  async up(q) {
    const rows = [
      {
        name: "Barcelona apartment",
        pin: "$$2b$10$c0RQM3UCfxPI.hI36bLaCOd1OJMVnqz3UrII5RfE4vZsPaz3b0Shm$10$YofT1NGWvI3Jm0u5kqgD2Ot9jRjqkb6nDqzjgvv3eHI82s1fA3p5u",
        pinEncrypted:
          "1c549f3152d96bd49a86610d:dff0e91efd1999c6:cfade6968e7917dc7eaaf755523e6fe2:90ad6ee6f2324d1a88b7b13c2f93eb9e:91a2fdb389a7e038faebd05c271d839d",
        image:
          "https://media.habitatapartments.com/photos/apartments/846x564/barcelona-balconies-10-livingroom.jpg",
      },
      {
        name: "Madrid apartment",
        pin: "$2b$10$AkmlqtK.zbR.aKrNv3LNsOet7B5o8HZaJifaabByDIkH9BCzNYN0m",
        pinEncrypted:
          "8e92cae9569fc0472da4d583:6b07a8c57bbc5b9a:b78369c32018c71404e9b4c79624464f",
        image:
          "https://luxuryrentalsmadrid.com/storage/app/uploads/public/639/9fb/90c/6399fb90cce58343045727.jpg",
      },
      {
        name: "Our cozy house",
        pin: "$10$DrJR8GcZSuRfqSWVQFlXxu5gj930DT9bSb9qm0Gya6e3s8X/JHlsG",
        pinEncrypted:
          "8b0c9fbb6d25ecffa632c2d7:d100896ebf84189b:0845b1e42fc6bcba2ada60d26cc2a477",
        image:
          "https://images.stockcake.com/public/f/e/f/fefec80b-9733-4b1c-bb16-354e59cb0bcb_large/cozy-pixel-home-stockcake.jpg",
      },
    ].map((x) => ({ ...x, createdAt: new Date(), updatedAt: new Date() }));

    await q.bulkInsert("groups", rows);
  },

  async down(q) {
    await q.bulkDelete("groups", null, {});
  },
};
