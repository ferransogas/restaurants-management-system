// Frequent operations

use("practica");

// Obtenir els restaurants d’un tipus de menjar específic ordenats per major valoració. 
db.restaurants.find({type_of_food: "Curry"}).sort({rating: -1});

// Obtenir els restaurant amb una qualificació superior a 4.9 (sobre 6) i ordenar per major valoració. 
db.restaurants.find({rating: {$gt: 4.9}}).sort({rating: -1});

// Obtenir les inspeccions d’un restaurant. 
db.inspections.find({restaurant_id: "55f14312c7447c3da7051d5c"});

// Obtenir els restaurants que tenen cert resultat d’inspecció. 
db.restaurants.aggregate([
  { $addFields: {
    stringId: { $toString: "$_id" }
    } },
  { $lookup: {
          "from": "inspections",
          "localField": "stringId",
          "foreignField": "restaurant_id",
          "as": "inspection_history"
    } },
  { $match: {
    "inspection_history.result": "Fail"
  } },
  { $project: {
    _id: 0,
    name: 1
  }}
]);