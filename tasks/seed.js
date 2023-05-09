import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import comments from "../data/comments.js";
import courses from "../data/courses.js";
import groups from "../data/groups.js";
import reviews from "../data/reviews.js";
import users from "../data/users.js";
import emails from "../data/emails.js";

const db = await dbConnection();//creating connection
await db.dropDatabase();//dropping database

// const aditya = await users.create('Aditya','Gupta','adityagupta@stevens.edu','lololol','anylink.com','cs', 2024)
// console.log(aditya);
const course1 = await courses.create('CS546', 'Web Development', ['Patrick Hill']);
const course2 = await courses.create('CS555', 'Sorting Algs', ['Ronz']);
const course3 = await courses.create('CS135', 'Discrete Structures', ['Sandheep Bhatt']);
const course4 = await courses.create('CS442', 'Database Management Systems', ['Samuel Kim']);
const course5 = await courses.create('CS511', 'Concurrent Programming', ['Eduardo Bonelli']);
const course6 = await courses.create('CS496', 'Principles of Programming Languages', ['Eduardo Bonelli']);
const course7 = await courses.create('CS522', 'App Development', ['Dominic Dugan']);
const course8 = await courses.create('CS541', 'AI', ['Susan Liu']);
const course9 = await courses.create('CS492', 'Operating Systems', ['Phillipe Meniuer']);
const course10 = await courses.create('CS115', 'Intro to Programming', ['Antonio Nicolosi']);
const course11 = await courses.create('CS101', 'Intro to CS', ['Nikos']);
const course12 = await courses.create('CS382', 'Computer Architecture and Organisation', ['Mordohai', 'Shudong Hao']);
const course13 = await courses.create('CS385', 'Algorithms', ['Phillipe Meniuer']);
const course14 = await courses.create('CS284', 'Data Structures', ['Tegan Brennan']);
const course15 = await courses.create('CS396', 'Securiy, Privacy, and Society', ['Nikos', 'Abrar']);
const course16 = await courses.create('CS545', 'Human-Computer Interaction', ['Nikos']);
const course17 = await courses.create('CS544', 'Health Informatics', ['Dr. Samantha Kleinberg   ']);
const course18 = await courses.create('CS347', 'Software Development Process', ['Reyza']);
const course19 = await courses.create('CS392', 'Systems Programming', ['Mordohai', 'Hao']);
const course20 = await courses.create('CS510', 'Principles of Programming Languages - G', ['Eduardo Bonelli']);
const course21 = await courses.create('CS423', 'Senior Design', ['Aaron Klappholz']);
const course22 = await courses.create('CS513', 'Data Mining', ['Kazi Lutful Kabir']);
const course23 = await courses.create('CS503', 'Discrete Math for Cryptography', ['Alexander Ushakov']);

const email1 = await emails.create('rmiller6@stevens.edu');
const email2 = await emails.create('test@stevens.edu');
const email3 = await emails.create('phill@stevens.edu');

/*ALL FUNCTIONS TESTED IN :
    Courses
    Emails
    Users
    Reviews
    lets say comments for now
*/
let test = undefined;
//let user1 = await users.create('testName', 'Robert', 'Miller', 'rmiller6@stevens.edu', 'testTest2@', ['CS555', 'CS546'], '2024');
// let user2 = await users.create('HeresThis', 'Me', 'Miller', 'test@stevens.edu', 'testTest2@', ['CS555', 'CS546'], 2024);
//let review1 = await reviews.create('CS555', user1._id, "test", 1, "Hill");
// let review2 = await reviews.create('CS555', user2._id, "Review 2", 2, "Hill");
// let group1 = await groups.create('CS555', 'Sparkles', [user2._id.toString()]);
//let group2 = await groups.create('CS555', 'Sparkles2', [user1._id.toString()]);
// console.log(user1);
// try { //test in here, if you dont the db is compromised
//     // test = await reviews.create('CS555', user1._id, "test", 1, "Hill");
// } catch (error) {
//     console.log(error);
// }
    // let allReviews = await reviews.getAll('CS555');
// console.log(test);
// await db.dropDatabase();//dropping database
await closeConnection();
console.log("Done!!");
