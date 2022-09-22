const express = require("express");
const Express = express();
Express.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    Express.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

Express.get("/movies/", async (request, response) => {
  const movieName = request.params;
  const movieQuery = `select movie_name  from movie `;
  const movieNameQuery = await db.all(movieQuery);
  response.send(
    movieNameQuery.map((eachName) => convertDbObjectToResponseObject(eachName))
  );
});

Express.post("/movies/", async (request, response) => {
  try {
    const movieQuery = request.body;
    const { directorId, movieName, leadActor } = movieQuery;
    const movieDetailsQuery = `
        INSERT INTO 
            movie (director_id, movie_name, lead_actor) 
        VALUES 
            (${directorId},${movieName},${leadActor});`;
    const movieResponse = await db.run(movieDetailsQuery);
    response.send("Movie Successfully Added");
  } catch (e) {
    console.log(e.message);
  }
});

Express.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailQuery = `select * from movie where movie_id = ${movieId}`;
  const movieDbResponse = await db.get(getMovieDetailQuery);
  response.send(convertDbObjectToResponseObject(movieDbResponse));
});

Express.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    update 
        movie 
    set 
        director_id = ${directorId},movie_name = ${movieName},lead_actor = ${leadActor} 
    where 
        movie_id = ${movieId}`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

Express.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

Express.get("/directors/", async (request, response) => {
  const directorQuery = `select * from director `;
  const directorTableQuery = await db.all(directorQuery);
  response.send(
    directorTableQuery.map((eachName) =>
      convertDbObjectToResponseObject(eachName)
    )
  );
});

Express.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirector = ` select movie_name from movie where director_id = ${directorId} `;
  const movieArray = await db.all(getMoviesByDirector);
  response.send(
    movieArray.map((eachArr) => convertDbObjectToResponseObject(eachArr))
  );
});

module.exports = Express;
