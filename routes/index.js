
import authRoutes from "./auth_routes.js";

import express from "express";



const app = express();

//makin empty commit



const constructorMethod = (app) => {
  
  app.use('/', authRoutes);

  



  


  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

export default constructorMethod;
