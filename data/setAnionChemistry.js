conn = new Mongo();
db = conn.getDB("swc");

function getChemistry (doc) {
  var anion = db.elements.find(
    {symbol: {$in: doc.elements}},
    {symbol: 1, X: 1, _id: 0}
  ).sort({X: -1}).limit(1)[0].symbol;
  switch (anion) {
  case "O":
    return "Oxide";
  case "S":
    return "Sulfide";
  case "F":
    return "Fluoride";
  case "Cl":
    return "Chloride";
  default:
    return null;
  }
};

db.materials.find(
  {elements: {$in: ["O", "S", "F", "Cl"]}}, {elements: 1}
).forEach(function (doc) {
  var anion = getChemistry(doc);
  db.materials.update({_id: doc._id}, {$set: {anion_chemistry: anion}});
});
