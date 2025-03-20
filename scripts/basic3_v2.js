// Originalment vam resoldre tots els exercisis del bàsic 3 (agregacions) 
// amb una sola consulta. En aquest fitxer hem repetit l'exercici fent 
// consultes individuals per cada operació plantejada.

use("practica");

// Agrupar restaurantes por tipo de comida y calcular la calificación promedio.
db.restaurants.aggregate([
    { $group: { _id: "$type_of_food", avgRating: { $avg: "$rating" } } }
]);


// Contar el número de inspecciones por resultado y mostrar los porcentajes.
db.inspections.aggregate([
    { $group: { _id: "$result", count: { $sum: 1 } } },
    { $group: {
        _id: null,
        results: { $push: { result: "$_id", count: "$count" } },
        total: { $sum: "$count" }
    }},
    { $unwind: "$results" },
    { $project: {
        _id: 0,
        result: "$results.result",
        count: "$results.count",
        percentage: { $multiply: [{ $divide: ["$results.count", "$total"] }, 100] }
    }}
]);


// Unir restaurantes con sus inspecciones utilizando $lookup.
db.restaurants.aggregate([
    { $addFields: { stringId: { $toString: "$_id" } } },
    { $lookup: {
        from: "inspections",
        localField: "stringId",
        foreignField: "restaurant_id",
        as: "inspection_history"
    }}
]);