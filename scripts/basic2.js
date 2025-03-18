use('practica');

// Buscar todos los restaurantes de un tipo de comida específico (ej. "Chinese").
db.restaurants.find({type_of_food: "Chinese"})

// Listar las inspecciones con violaciones, ordenadas por fecha.
// Si se considera warning y fail como violaciones
db.inspections.find({ 
    result: {result: "Violation Issued"}
  }).sort({date: 1})

// Si unicamente se considera fail como violacion
db.inspections.find({result: "Fail"}).sort({date: 1})

// Encontrar restaurantes con una calificación superior a 4.
db.restaurants.find({rating: {$gt: 4}})
