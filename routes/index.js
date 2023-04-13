// This file will import both route files and export the constructor method as shown in the lecture code


import express from "express";

const app = express();
// import bandRoutes from "./bands.js";
// import albumRoutes from "./albums.js";

const constructorMethod = (app) => {


  app.use("*", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
};

export default constructorMethod;
