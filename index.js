import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "",
  port: 5432
})

db.connect();

app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM visited_countries");
  const visited_countries = result.rows.map(country => country.country_code);

  res.render("index.ejs", {countries: visited_countries, total: visited_countries.length})
  db.end()
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
