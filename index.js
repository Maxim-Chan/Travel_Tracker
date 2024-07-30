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

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisitedCountries(){
  const result = await db.query("SELECT * FROM visited_countries");
  return result.rows.map(country => country.country_code);
}

app.get("/", async (req, res) => {
  const visited_countries = await checkVisitedCountries();

  res.render("index.ejs", {
    countries: visited_countries, 
    total: visited_countries.length,
    users: users,
    color: "teal"
  })

});

app.post("/add", async (req, res) => {
  const inputCountry = req.body.country;
  
  try{
    const countryPattern = `.*${inputCountry}.*`
    const result = await db.query("SELECT country_code FROM countries WHERE country_name ~* $1", [countryPattern]);
    const country_code = result.rows[0].country_code;
    
    try{
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [country_code]);
      res.redirect("/")

    } catch(error) {
      const visited_countries = await checkVisitedCountries();
      res.render("index.ejs", {
        countries: visited_countries, 
        total: visited_countries.length, 
        users: users,
        color: "teal",
        error: "Country has already been added, try again.",})
    }
  } catch (error) {
    console.log(error);
    const visited_countries = await checkVisitedCountries();
    res.render("index.ejs", {
      countries: visited_countries,
      total: visited_countries.length, 
      users: users,
      color: "teal",
      error: "Country name does not exist, try again."})
  }

})


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
