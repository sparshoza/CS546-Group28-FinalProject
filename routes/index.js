


import express from "express";

const app = express();



const constructorMethod = (app) => {
  app.use('/', authRoutes);


  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

export default constructorMethod;
