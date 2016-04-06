conn = new Mongo();
db = conn.getDB("swc");

db.elements.drop(); // If it exists, drop it
pt = db.periodic_tables.findOne();
Object.keys(pt).forEach(function (symbol) {
  if (symbol === '_id') return;
  doc = {symbol: symbol};
  Object.assign(doc, pt[symbol]);
  db.elements.insert(doc);
});
