// Indexes creation

use("practica");

db.restaurants.getIndexes();
db.restaurants.createIndex({ type_of_food: 1, rating: -1 }, { name: "type_of_food_rating" });

db.restaurants.createIndex(
    { rating: -1 },
    { partialFilterExpression: { rating: { $gt: 4.9 } }, name: "rating_gt_4_9" }
  );

db.inspections.createIndex({ restaurant_id: 1 }, { name: "restaurant_id" });

db.inspections.createIndex({ result: 1 }, { name: "result" });