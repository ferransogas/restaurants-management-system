// PRÀCTICA ATS 1 - EXERCICI BÀSIC 3

use('practica');

db.restaurants.aggregate([
  /*
  lookup per fer un join de les dues col·leccions, incrustant l'historial d'inspeccions a cada restaurant.
  - com que $restauran_id és un string i no un ObjectId, afegim un valor al restaurant que sigui un cast a string del seu _id
  -- és més eficient fer el cast de ObjectId a string que de string a ObjectId ja que hi ha menys restaurants que inspeccions
  - s'utilitza stringId per comparar amb restaurant_id
  - as guarda el resultat de la join a inspection_history
  */
  { $addFields: {
    stringId: { $toString: "$_id" }
    } },
  { $lookup: {
          "from": "inspections",
          "localField": "stringId",
          "foreignField": "restaurant_id",
          "as": "inspection_history"
    } },

  /*
  addFields per calcular el nombre d'inspeccions passades, fallades, amb violació, sense violació i amb avís
  - filter per filtrar les inspeccions de inspection_history segons result
  - size per calcular la longitud de l'array resultant del filter
  */
  { $addFields: {
    "num_pass": 
      { $size: { $filter: {
        input: "$inspection_history",
        as: "inspection",
        cond: { $eq: [ "$$inspection.result", "Pass" ] }
    } } },
    "num_fail":
      { $size: { $filter: {
        input: "$inspection_history",
        as: "inspection",
        cond: { $eq: [ "$$inspection.result", "Fail" ] }
    } } },
    "num_violation_issued": 
      { $size: { $filter: {
        input: "$inspection_history",
        as: "inspection",
        cond: { $eq: [ "$$inspection.result", "Violation Issued" ] }
    } } },
    "num_no_violation_issued": 
      { $size: { $filter: {
        input: "$inspection_history",
        as: "inspection",
        cond: { $eq: [ "$$inspection.result", "No Violation Issued" ] }
    } } },
    "num_warning_issued": 
      { $size: { $filter: {
        input: "$inspection_history",
        as: "inspection",
        cond: { $eq: [ "$$inspection.result", "Warning Issued" ] }
    } } }
 }},

  /*
  group per agrupar els restaurants segons el type_of_food i afegint els camps d'interès
  - num_inspections és el nombre total d'inspeccions de tots els restaurants d'un mateix tipus de menjar
  - avg_rating és la mitjana de les puntuacions dels restaurants d'un mateix tipus de menjar
  - num_* són els nombres totals de cada resultat d'inspecció
  */
  { $group: {
    _id: "$type_of_food",
    avg_rating: { $avg: "$rating" },
    num_inspections: { $sum: { $size: "$inspection_history" } },
    num_pass: { $sum: "$num_pass" },
    num_fail: { $sum: "$num_fail" },
    num_violation_issued: { $sum: "$num_violation_issued" },
    num_no_violation_issued: { $sum: "$num_no_violation_issued" },
    num_warning_issued: { $sum: "$num_warning_issued" }
  } },

  /*
  group per calcular el nombre d'inspeccions total
  - groups és un array amb els restaurants agrupats per type_of_food
  */
  { $group: {
      _id: null,
      total_inspections: { $sum: "$num_inspections" },
      groups: { $push: { 
          type_of_food: "$_id", 
          avg_rating: "$avg_rating",
          num_inspections: "$num_inspections",
          num_pass: "$num_pass",
          num_fail: "$num_fail",
          num_violation_issued: "$num_violation_issued",
          num_no_violation_issued: "$num_no_violation_issued",
          num_warning_issued: "$num_warning_issued"   
      } }
  } },

  /*
  unwind per desagrupar els restaurants i així tenir total_inspections en cada document de restaurant
  */
  { $unwind: "$groups" },

  /*
  project per mostrar els camps d'interès
  - percent_of_inspections és el percentatge d'inspeccions de tots els restaurants d'un mateix tipus de menjar sobre el total d'inspeccions
  - percent_* és el percentatge d'inspeccions amb cada resultat sobre les inspeccions de restaurants d'un mateix tipus de menjar
  */
  { $project: {
      _id: 0,
      type_of_food: "$groups.type_of_food",
      avg_rating: "$groups.avg_rating",
      num_inspections: "$groups.num_inspections",
      percent_of_inspections: { $multiply: [ { $divide: [ "$groups.num_inspections", "$total_inspections" ] }, 100 ] },
      percent_pass: { $multiply: [ { $divide: [ "$groups.num_pass", "$groups.num_inspections" ] }, 100 ] },
      percent_fail: { $multiply: [ { $divide: [ "$groups.num_fail", "$groups.num_inspections" ] }, 100 ] },
      percent_violation_issued: { $multiply: [ { $divide: [ "$groups.num_violation_issued", "$groups.num_inspections" ] }, 100 ] },
      percent_no_violation_issued: { $multiply: [ { $divide: [ "$groups.num_no_violation_issued", "$groups.num_inspections" ] }, 100 ] },
      percent_warning_issued: { $multiply: [ { $divide: [ "$groups.num_warning_issued", "$groups.num_inspections" ] }, 100 ] },
  } },

  /*
  sort per ordenar els restaurants segons la mitjana de les puntuacions en ordre descendent
  */
  { $sort: { avg_rating: -1 } }
]);