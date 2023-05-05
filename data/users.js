import { users, emails, courses } from "../config/mongoCollections.js";
import bcrypt from 'bcrypt';
const saltRounds = 3;
import {ObjectId} from 'mongodb';

export const create = async(
    //fields of input here
    username, //special username
    firstName, // does the size need to  be checked
    lastName,  // does the size need to be checked
    stevensEmail, //find duplicates of the email //NO DUPLICATES
    password, //has to be hashed here 
    courses, //INPUT IS AN ARRAY CONTAINING THE LOWER PARTS
    graduationYear // i dont think we need graduation year but open to discussion
    //reviews and comment will be set to empty arrays, since a new account has done neither.
) =>{

    //error handling 
    // reAdd username
    if(!username || !firstName || !lastName || !courses || !stevensEmail || !password || !graduationYear){throw 'all fields must be present';}
    if(typeof username !== 'string' || username.trim().length === 0 || typeof firstName !== 'string' || typeof lastName !== 'string' || typeof stevensEmail !== 'string' || typeof password !== 'string' ||firstName.trim().length === 0 || lastName.trim().length === 0 || stevensEmail.trim().length === 0 || password.trim().length === 0){throw 'all string inputs must be non-empty strings!';}
    if(typeof graduationYear !== 'number' || graduationYear === NaN){throw "graduationYear must be a non-zero number";}
    //trim the strings
    username = username.trim();
    firstName = firstName.trim();
    lastName = lastName.trim();
    stevensEmail = stevensEmail.trim().toLowerCase(); //stored as lowercase string
    password = password.trim();
    if(username.length > 12 || username.length < 3){throw 'username must be between 3 and 12 characters!';}
    //The regex statement below replaces all non-alphabetical characters with blank spaces, leaving only non-alphabetical characters
    if(firstName.replace(/[a-z]/gi, "").length !== 0 || lastName.replace(/[a-z]/gi, "").length !== 0){throw 'First and Last name can only contain letters!';}
    //if(stevensEmail.substring(stevensEmail.length -12) !== "@stevens.edu" || (stevensEmail[0] !== firstName.toLowerCase()) || stevensEmail.substring(1, lastName.length + 1) != lastName.toLowerCase()){throw "Stevens Email must follow format";}
    if(stevensEmail.substring(stevensEmail.length -12) !== "@stevens.edu"){throw "Stevens Email must follow format";}
    // if(website.substring(0,11) !== "http://www." || website.substring(website.length -4) !== ".com" || website.substring(11, website.length -4).trim().length < 5){throw "website must be a valid website!";} should we check url
    const date = new Date();
    if(graduationYear < date.getFullYear() || graduationYear > date.getFullYear() + 5){throw 'Date must be between current year and 5 in the future';}
    
    const aUser = await userCollection.findOne({stevensEmail : stevensEmail});
    if(aUser !== null){throw 'Email is already linked to an account!'};
    let emailCollection = await emails();
    const aUser2 = await userCollection.findOne({username : username});
    if(aUser2 !== null){throw 'Username is already in use!'};
    let valid = await emailCollection.findOne({email : stevensEmail});
    if(valid === null){throw 'Email is not a valid stevens email address!'};
    if(!Array.isArray(courses) || courses.length === 0){throw 'courses input must be a non-empty array'}
    let courseCollection = await courses();
    let index = 0;
    let toValidArr = [];
    courses.array.forEach(element => {
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all courses must be non-empty strings'};
        courses[index] = element.trim();
        element = element.trim();
        if(element.length !== 5){throw 'Course must be in the format of CS### (# = course number)'};
        if(element.substring(0,2) !== 'CS'){throw 'Only courses in the CS section are supported at this time!'};
        toValidArr[index] = element; //Can't do an 'await' call in a forEach loop, so IM doing this another loop, sorry
        index += 1;
    });
    let counter = 0;
    //validate all course codes
    //also add user to that course
    while(counter < index){
        let valid = await courseCollection.findOne({courseCode : toValidArr[counter]});
        if(valid === null){throw toValidArr[counter] + " is an invalid course code"};
        counter += 1;
    }

    //main program starts

    let hashedPassword = await bcrypt.hash(password, saltRounds);

    let newUser = {
        username : username,
        firstName: firstName,
        lastName: lastName,
        stevensEmail: stevensEmail,
        password: hashedPassword,
        courses : courses,
        graduationYear: graduationYear,
        reviews: [], //empty
        comments: [] //empty
    };
    const userCollection = await users();

    const insertInfo = await userCollection.insertOne(newUser);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'User could not be added';
    }

    const newId = insertInfo.insertedId.toString();
    counter = 0;
    while(counter < index){
        let courseList = valid.students; //grab the old list of course
        courseList.append(newId); //add userId to the course list of students
        let updateInfo = await courseCollection.findOneAndUpdate(
            {courseCode : toValidArr[counter]},
            {$set : {students : courseList}},
            {returnDocument : 'after'}
        );
        if(updateInfo.lastErrorObject.n === 0){throw 'could not update courses successfulyl!';}
        counter += 1;
    }
    const user = await get(newId);
    return user;
};

export const getAll = async () =>{
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();
    if(!userList){throw 'could not find all users';}
    userList = userList.map((element)=>{
        element._id = element._id.toString();
        return element;
    });
    return userList;
};

export const get = async (id) =>{
    if(!id){throw 'id must exist!';}
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    const userCollection = await users();
    const aUser = await userCollection.findOne({_id: new ObjectId(id)});
    if(aUser === null){throw 'no user with that id';}
    aUser._id = aUser._id.toString();
    return aUser;
};

export const remove = async (id) =>{ //in case user logs out
    if(!id){throw 'id must exist!';}
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    const userCollection = await users();
    const deleteInfo = await userCollection.findOneAndDelete({
        _id: new ObjectId(id)});
    if(deleteInfo.lastErrorObject.n === 0){throw `Could not delete user with id of ${id}`;}
    return `${deleteInfo.value.name} has been successfully deleted!`; 
};

export const update = async ( //wont be used to add courses, so I will omit that update check from this function
    id,
    username,
    firstName,
    lastName,
    stevensEmail, 
    hashedPassword, //has to be unhashed
    courses,
    graduationYear 
) =>{
    if(!id || !username || !firstName || !lastName || !courses || !stevensEmail || !hashedPassword || !graduationYear){throw 'all fields must be present';}
    if(typeof username !== 'string' || username .trim().length === 0 || typeof id !== 'string' || id.trim().length === 0 || typeof firstName !== 'string' || typeof lastName !== 'string' || typeof stevensEmail !== 'string' || typeof hashedPassword !== 'string' || firstName.trim().length === 0 || lastName.trim().length === 0 || stevensEmail.trim().length === 0 || hashedPassword.trim().length === 0){throw 'all string inputs must be non-empty strings!';}
    if(typeof graduationYear !== 'number' || graduationYear === NaN){throw "graduationYear must be a non-zero number";}
    //trim the strings
    id = id.trim();
    username = username.trim();
    firstName = firstName.trim();
    lastName = lastName.trim();
    stevensEmail = stevensEmail.trim().toLowerCase();
    hashedPassword = hashedPassword.trim();
    
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    //The regex statement below replaces all non-alphabetical characters with blank spaces, leaving only non-alphabetical characters
    if(firstName.replace(/[a-z]/gi, "").length !== 0 || lastName.replace(/[a-z]/gi, "").length !== 0){throw 'First and Last name can only contain letters!';}
    if(stevensEmail.substring(stevensEmail.length -12) !== "@stevens.edu" || (stevensEmail[0] !== firstName.toLowerCase()[0]) || stevensEmail.substring(1, lastName.length + 1) != lastName.toLowerCase()){throw "Stevens Email must follow format";}
    // if(website.substring(0,11) !== "http://www." || website.substring(website.length -4) !== ".com" || website.substring(11, website.length -4).trim().length < 5){throw "website must be a valid website!";} should we check url
    const date = new Date();
    if(graduationYear < date.getFullYear() || graduationYear > date.getFullYear() + 5){throw 'Date must be between current year and 5 in the future';}
    const userCollection = users();
    const emailCollection = await emails();
    let valid = await emailCollection.findOne({email : stevensEmail});
    if(valid === null){throw 'Email is not a valid stevens email address!'};
    const aUser2 = await userCollection.findOne({username : username});
    if(aUser2 !== null){throw 'Username is already in use!'};
    if(!Array.isArray(courses) || courses.length === 0){throw 'courses input must be a non-empty array'}
    let courseCollection = await courses();
    let index = 0;
    let toValidArr = [];
    courses.array.forEach(element => {
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all courses must be non-empty strings'};
        courses[index] = element.trim();
        element = element.trim();
        if(element.length !== 5){throw 'Course must be in the format of CS### (# = course number)'};
        if(element.substring(0,2) !== 'CS'){throw 'Only courses in the CS section are supported at this time!'};
        toValidArr[index] = element; //Can't do an 'await' call in a forEach loop, so IM doing this another loop, sorry
        index += 1;
    });
    let counter = 0;
    //validate all course codes
    while(counter < index){
        let valid = await courseCollection.findOne({courseCode : toValidArr[counter]});
        if(valid === null){throw toValidArr[counter] + " is an invalid course code"};
        counter += 1;
    }
    //check now to see if a field has changed
    let check = false;
    let preUp = await get(id);
    if(preUp.stevensEmail !== stevensEmail){ //do this check here SO IT DOESNT JUST FIND THE SAME EMAIL AGAIN IN THE DB
        const aUser = await userCollection.findOne({stevensEmail : stevensEmail});
        if(aUser !== null){throw 'Email is already linked to an account!'};
        check = true;
    }
    //UNHASH THE PASSWORD HERE
    let compareToMatch = false;
    try {
      compareToMatch = await bcrypt.compare(hashedPassword, preUp.password); //compare hash to password provided
    } catch (error) {
     //no op 
     throw 'internel server error'
    }
    let newHashedPassword = preUp.password; //set this to the previous password if its not different
    if(!compareToMatch){
        check = true
        newHashedPassword = await bcrypt.hash(hashedPassword, saltRounds);
    };
    if(preUp.username === username && preUp.firstName === firstName && preUp.lastName === lastName && !check && preUp.graduationYear === graduationYear) {throw 'at least one field must have changed!';}
    let updatedUser = {
        username : username,
        firstName: firstName,
        lastName : lastName,
        stevensEmail : stevensEmail, 
        hashedPassword : newHashedPassword, //IT MUST BE HASHED BEFORE THIS
        courses : courses,
        graduationYear: graduationYear
    };
    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$set : updatedUser},
        {returnDocument : 'after'}
    );
    if(updatedInfo.lastErrorObject.n === 0){ throw 'could not update user successfully';}
    updatedInfo.value._id = updatedInfo.value._id.toString();
    return updatedInfo.value;
};

export const checkUser = async (emailAddress, password) => {

    if(!emailAddress || !password) {throw 'all inputs must be provided';}
    if(typeof emailAddress !== 'string' || typeof password !== 'string' || emailAddress.trim().length === 0 || password.trim().length === 0) {throw 'both inputs must be non-empty string';}
    //trim strings
    emailAddress = emailAddress.trim().toLowerCase();
    password = password.trim();
    //email check
    let check = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; //regex I found that fulfills email address requirements
    if(!emailAddress.match(check)){throw 'emailaddress input must follow the standard email address pattern';}
    let emailCollection = await emails();
    let anEmail = emailCollection.findOne({email : emailAddress});
    if(anEmail === null){'this is not a valid email'};
    //password check
    let upperCheck = /[A-Z]/;
    let numberCheck = /[0-9]/;
    let specialCheck = /[!@#$%^&*-?]/; //allows for the special characters in number row and ?
    if(!password.match(upperCheck) || !password.match(numberCheck) || !password.match(specialCheck)){throw 'password must contain at least one uppercase letter, one number and one special character';}
    //validating done
    const userCollection = await users();
    const aUser = await userCollection.findOne({stevensEmail : emailAddress}); 
    if(!aUser){throw 'Either the email address or password is incorrect';}
    let compareToMatch = false;
    try {
      compareToMatch = await bcrypt.compare(password, aUser.password); //compare hash to password provided
    } catch (error) {
     //no op 
     throw 'internel server error'
    }
    if(compareToMatch){
      let new_user = {firstName : aUser.firstName, lastName: aUser.lastName, emailAddress: aUser.emailAddress, role: aUser.role};
      return true;
    } else {
      throw 'Either the email address or password is incorrect';
    }
  };


export const addCourse = async (id, newCourses) =>{

    if(!id, !newCourses){throw 'id and newCourses must be provided!'};
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!'};
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    if(Array.isArray(newCourses)){throw 'newCourses must be an array'};
    if(newCourses.length === 0){throw 'newCourses cannot be empty!'};

    let courseCollection = await courses();
    let index = 0;
    let toValidArr = [];
    newCourses.array.forEach(element => {
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all courses must be non-empty strings'};
        newCourses[index] = element.trim();
        element = element.trim();
        if(element.length !== 5){throw 'Course must be in the format of CS### (# = course number)'};
        if(element.substring(0,2) !== 'CS'){throw 'Only courses in the CS section are supported at this time!'};
        toValidArr[index] = element; //Can't do an 'await' call in a forEach loop, so IM doing this another loop, sorry
        index += 1;
    });
    const userCollection = await users();
    const aUser = await userCollection.findOne({_id: new ObjectId(id)});
    if(aUser === null){throw 'no user with that id';}
    let courseList = aUser.courses;
    courseList.append(newCourses);
    if(new Set(courseList).size !== newCourses.length){throw 'User is already in one of these courses'};

    let counter = 0;
    //validate all course codes
    while(counter < index){
        let valid = await courseCollection.findOne({courseCode : toValidArr[counter]});
        if(valid === null){throw toValidArr[counter] + " is an invalid course code"};
        let courseList = valid.students;
        courseList.append(toValidArr[counter]);
        let updateInfo = await courseCollection.findOneAndUpdate(
            {courseCode : toValidArr[counter]},
            {$set : {students : courseList}},
            {returnDocument : 'after'}
        );
        if(updateInfo.lastErrorObject.n === 0){throw 'could not update courses successfulyl!';}
        counter += 1;
    }
    //get the user
    const updatedInfo = await findOneAndUpdate(
    {_id : new ObjectId(id)},
    {$set : {courses : courseList}},
    {returnDocument : 'after'});
    if(updatedInfo.lastErrorObject.n === 0){throw 'could not update user courses successfully'};
    updatedInfo.value._id = updatedInfo.value._id.toString();
    return aUser;
};

export const removeCourse = async (id, removeCourses) =>{
    if(!id, !removeCourses){throw 'id and removeCourses must be provided!'};
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!'};
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    if(Array.isArray(removeCourses)){throw 'removeCourses must be an array'};
    if(removeCourses.length === 0){throw 'removeCourses cannot be empty!'};
    //check the courses
    let courseCollection = await courses();
    let index = 0;
    let toValidArr = [];
    removeCourses.array.forEach(element => {
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all courses must be non-empty strings'};
        removeCourses[index] = element.trim();
        element = element.trim();
        if(element.length !== 5){throw 'Course must be in the format of CS### (# = course number)'};
        if(element.substring(0,2) !== 'CS'){throw 'Only courses in the CS section are supported at this time!'};
        toValidArr[index] = element; //Can't do an 'await' call in a forEach loop, so IM doing this another loop, sorry
        index += 1;
    });
    let counter = 0;
    //validate all course codes
    while(counter < index){
        let valid = await courseCollection.findOne({courseCode : toValidArr[counter]});
        if(valid === null){throw toValidArr[counter] + " is an invalid course code"};
        counter += 1;
    }
    //get user
    let check = false;
    const userCollection = await users();
    const aUser = await userCollection.findOne({_id: new ObjectId(id)});
    if(aUser === null){throw 'no user with that id';}
    let courseList = aUser.courses;
    removeCourses.forEach(remove =>{
        index = 0; //reset index
        check = false;
        courseList.forEach(course =>{
            if(course === remove){
                courseList.splice(index, 1);
                check = true;
            }
            index +=1 ;
        });
        if(!check){throw 'user is not in ' + remove};
    });
    index = 0;
    
    while(index < removeCourses.length){
        //find the course to remove its user
        let aCourse = courseCollection.findOne({courseCode : removeCourses[index]});

        index += 1;
    }
    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id : new ObjectId(id)},
        {$set : {courses : courseList}},
        {returnDocument : 'after'});
        if(updatedInfo.lastErrorObject.n === 0){throw 'could not update user courses successfully'};
        updatedInfo.value._id = updatedInfo.value._id.toString();
        return aUser;
};

export default {create, getAll, get, remove, update, addCourse, removeCourse, checkUser};
