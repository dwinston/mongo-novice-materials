conn = new Mongo();
db = conn.getDB("swc");

function lessElectronegBinaries (symbols) {
  var elements = symbols.map(function (s) {
    return db.elements.findOne({symbol: s});
  });
  var systems = [];
  elements.forEach(function (elt) {
    db.elements.find({X: {$lt: elt.X}}).forEach(function (other) {
      systems.push([elt.symbol, other.symbol].sort().join("-"));
    });
  });
  return systems;
};
