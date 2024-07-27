import { count } from "console";
import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
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

});

app.post("/add", async (req, res) => {

  const inputCountry = req.body.country;
  const result = await db.query("SELECT country_code FROM countries WHERE country_name = $1", [inputCountry]);
  
  if (result.rows.length > 0){
    const country_code = result.rows[0].country_code;
    
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [country_code]);
    res.redirect("/");
  } else {
    console.error("Error 404. This country does not exist");
    res.redirect("/");
  }
})


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
