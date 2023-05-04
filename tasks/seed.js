import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import comments from "../data/comments.js";
import courses from "../data/courses.js";
import groups from "../data/groups.js";
import reviews from "../data/reviews.js";
import users from "../data/users.js";

const db = await dbConnection();//creating connection



// const aditya = await users.create('Aditya','Gupta','adityagupta@stevens.edu','lololol','anylink.com','cs', 2024)
// console.log(aditya);



    




await db.dropDatabase();//dropping database

await closeConnection();
console.log("Done!!");
