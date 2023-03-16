const mongoose = require("mongoose");

const DB_URI = process.env.MONGODB_URI || "mongodb://0.0.0.0:27017/blogDB"
mongoose.connect(DB_URI, {useNewUrlParser: true}).then(() => {
  console.log("Connected to Database");
}).catch((err) => {
  console.log("Not Connected to Database ERROR! ", err);
});

"mongodb+srv://my_journal_production:ybuan31ujzusBaEk@myjournalproductionclus.fuecqpp.mongodb.net/?retryWrites=true&w=majority"

module.exports = mongoose