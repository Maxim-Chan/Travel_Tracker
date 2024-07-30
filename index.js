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

async function checkVisitedCountries(){
  const result = await db.query(
    `SELECT * FROM visited_countries WHERE user_id = ${currentUserId}`
  );
  return result.rows.map(country => country.country_code);
}

async function getAllUsers(){
  const result = await db.query("SELECT * FROM users");
  return result.rows;
}

async function getCurrentUser(){
  const result = await db.query("SELECT * FROM users");
  return result.rows.find(user => user.id === currentUserId);
}

let currentUserId = 1;

app.get("/", async (req, res) => {
  const visited_countries = await checkVisitedCountries();
  const users = await getAllUsers();
  const user = await getCurrentUser();

  res.render("index.ejs", {
    countries: visited_countries, 
    total: visited_countries.length,
    users: users,
    colour: user.colour
  })
  console.log(user)
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
      const users = await getAllUsers();
      const user = await getCurrentUser();

      res.render("index.ejs", {
        countries: visited_countries, 
        total: visited_countries.length, 
        users: users,
        colour: user.colour,
        error: "Country has already been added, try again."})
    }

  } catch (error) {
    const visited_countries = await checkVisitedCountries();
    const users = await getAllUsers();
    const user = await getCurrentUser();

    res.render("index.ejs", {
      countries: visited_countries,
      total: visited_countries.length, 
      users: users,
      colour: user.colour,
      error: "Country name does not exist, try again."})
  }
})

app.post("/user", (req, res) => {
  if (req.body.add === "new"){
    res.render("new.ejs");
  } else {
    currentUserId = parseInt(req.body.user);
    res.redirect("/");
  }
})


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
