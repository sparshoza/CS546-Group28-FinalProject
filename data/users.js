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
    coursesInput, //INPUT IS AN ARRAY CONTAINING THE LOWER PARTS
    graduationYear
    //reviews and comment will be set to empty arrays, since a new account has done neither.
) =>{

    //error handling 
    // reAdd username
    if(!username || !firstName || !lastName || !coursesInput || !stevensEmail || !password || !graduationYear){throw 'all fields must be present';}
    if(typeof username !== 'string' || username.trim().length === 0 || typeof firstName !== 'string' || typeof lastName !== 'string' || typeof stevensEmail !== 'string' || typeof password !== 'string' ||firstName.trim().length === 0 || lastName.trim().length === 0 || stevensEmail.trim().length === 0 || password.trim().length === 0){throw 'all string inputs must be non-empty strings!';}
    if(typeof graduationYear !== 'string' || graduationYear.trim().length === 0){throw 'graduation year must be a string!';}
    if(graduationYear.replace(/[0-9]/gi, "").length !== 0 ){throw 'Graduation year only contains numbers!';}
    graduationYear = parseInt(graduationYear);
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
    const userCollection = await users();
    const aUser = await userCollection.findOne({stevensEmail : stevensEmail});
    if(aUser !== null){throw 'Email is already linked to an account!'};
    let emailCollection = await emails();
    const aUser2 = await userCollection.findOne({username : username});
    if(aUser2 !== null){throw 'Username is already in use!'};
    let valid = await emailCollection.findOne({email : stevensEmail});
    if(valid === null){throw 'Email is not a valid stevens email address!'};
    if(!Array.isArray(coursesInput) || coursesInput.length === 0){throw 'courses input must be a non-empty array'}
    let courseCollection = await courses();
    let index = 0;
    let toValidArr = [];
    coursesInput.forEach(element => {
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all courses must be non-empty strings'};
        element = element.trim().toLowerCase();
        coursesInput[index] = element;
        if(element.length !== 5){throw 'Course must be in the format of CS### (# = course number)'};
        if(element.substring(0,2) !== 'cs'){throw 'Only courses in the CS section are supported at this time!'};
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
        courses : coursesInput,
        graduationYear: graduationYear,
        reviews: [], //empty
        comments: [] //empty
    };
    const insertInfo = await userCollection.insertOne(newUser);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'User could not be added';
    }

    const newId = insertInfo.insertedId.toString();
    
    counter = 0;
    while(counter < index){
        valid = await courseCollection.findOne({courseCode: toValidArr[counter]});
        let courseList = valid.students; //grab the old list of course
        courseList.push(newId); //add userId to the course list of students
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

export const remove = async (id) =>{
    if(!id){throw 'id must exist!';}
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    const userCollection = await users();
    const aUser = await get(id);
    let classList = aUser.courses;
    let removedCourse = await removeCourse(id, classList);
    const deleteInfo = await userCollection.findOneAndDelete({
        _id: new ObjectId(id)});
    if(deleteInfo.lastErrorObject.n === 0){throw `Could not delete user with id of ${id}`;}
    return `${deleteInfo.value.firstName} has been successfully deleted!`; 
};

export const update = async ( //wont be used to add courses, so I will omit that update check from this function
    id,
    username,
    firstName,
    lastName,
    stevensEmail, 
    hashedPassword, //has to be unhashed
    coursesInput, //can be removed?
    graduationYear 
) =>{
    if(!id || !username || !firstName || !lastName || !coursesInput || !stevensEmail || !hashedPassword || !graduationYear){throw 'all fields must be present';}
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
    const userCollection = await users();
    const emailCollection = await emails();
    let valid = await emailCollection.findOne({email : stevensEmail});
    if(valid === null){throw 'Email is not a valid stevens email address!'};
    if(!Array.isArray(coursesInput) || coursesInput.length === 0){throw 'courses input must be a non-empty array'}
    let courseCollection = await courses();
    let index = 0;
    let toValidArr = [];
    coursesInput.forEach(element => {
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all courses must be non-empty strings'};
        coursesInput[index] = element.trim();
        element = element.trim();
        if(element.length !== 5){throw 'Course must be in the format of CS### (# = course number)'};
        if(element.substring(0,2) !== 'cs'){throw 'Only courses in the CS section are supported at this time!'};
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
    let aUser2 = await userCollection.findOne({username : username});
    if(aUser2 !== null && preUp.username !== aUser2.username){throw 'Username is already in use!'};
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
        courses : coursesInput,
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
      let new_user = {firstName : aUser.firstName, lastName: aUser.lastName, emailAddress: aUser.stevensEmail, courses: aUser.courses, username: aUser.username, userId: aUser._id};
      return new_user;
    } else {
      throw 'Either the email address or password is incorrect';
    }
  };            

export const addCourse = async (id, newCourses) =>{

    if(!id, !newCourses){throw 'id and newCourses must be provided!'};
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!'};
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    if(!Array.isArray(newCourses)){throw 'newCourses must be an array'};
    if(newCourses.length === 0){throw 'newCourses cannot be empty!'};

    let courseCollection = await courses();
    let index = 0;
    let toValidArr = [];
    newCourses.forEach(element => {
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all courses must be non-empty strings'};
        newCourses[index] = element.trim();
        element = element.trim();
        if(element.length !== 5){throw 'Course must be in the format of CS### (# = course number)'};
        if(element.substring(0,2) !== 'cs'){throw 'Only courses in the CS section are supported at this time!'};
        toValidArr[index] = element; //Can't do an 'await' call in a forEach loop, so IM doing this another loop, sorry
        index += 1;
    });
    const userCollection = await users();
    const aUser = await userCollection.findOne({_id: new ObjectId(id)});
    if(aUser === null){throw 'no user with that id';}
    let courseList = aUser.courses;
    let length = courseList.length;
    courseList = courseList.concat(newCourses);
    if(new Set(courseList).size === length){throw 'User is already in one of these courses'};

    let counter = 0;
    //validate all course codes
    while(counter < index){
        let valid = await courseCollection.findOne({courseCode : toValidArr[counter]});
        if(valid === null){throw toValidArr[counter] + " is an invalid course code"};
        counter += 1;
    }
    //add user to courses list
    index = 0;
    while(index < newCourses.length){
        //find the course to remove its user
        let aCourse = await courseCollection.findOne({courseCode : newCourses[index]});
        let studentArr = aCourse.students;
        studentArr.push(id);
        const updatedInfo1 = await courseCollection.findOneAndUpdate(
            {courseCode : newCourses[index]},
            {$set : {students : studentArr}},
            {returnDocument : 'after'});
            if(updatedInfo1.lastErrorObject.n === 0){throw 'could not update course'};
        index += 1;
    }
    //get the user

    const updatedInfo = await userCollection.findOneAndUpdate(
    {_id : new ObjectId(id)},
    {$set : {courses : courseList}},
    {returnDocument : 'after'});
    courseList.push(newCourses[counter]);
    if(updatedInfo.lastErrorObject.n === 0){throw 'could not update user courses successfully'};
    updatedInfo.value._id = updatedInfo.value._id.toString();
    const newUser = await get(updatedInfo.value._id);
    return newUser;
};

export const removeCourse = async (id, removeCourses) =>{
    if(!id, !removeCourses){throw 'id and removeCourses must be provided!'};
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!'};
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    if(!Array.isArray(removeCourses)){throw 'removeCourses must be an array'};
    if(removeCourses.length === 0){throw 'removeCourses cannot be empty!'};
    //check the courses
    let courseCollection = await courses();
    let index = 0;
    let toValidArr = [];
    removeCourses.forEach(element => {
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all courses must be non-empty strings'};
        removeCourses[index] = element.trim();
        element = element.trim();
        if(element.length !== 5){throw 'Course must be in the format of CS### (# = course number)'};
        if(element.substring(0,2) !== 'cs'){throw 'Only courses in the CS section are supported at this time!'};
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
    let index2 = 0;
    while(index < removeCourses.length){
        //find the course to remove its user
        let aCourse = await courseCollection.findOne({courseCode : removeCourses[index]});
        let studentArr = aCourse.students;
        index2 = 0;
        studentArr.forEach(student => {
            if(student === id){
                studentArr.splice(index2, 1);
            }
            index2 += 1;
        });
        const updatedInfo1 = await courseCollection.findOneAndUpdate(
            {courseCode : removeCourses[index]},
            {$set : {students : studentArr}},
            {returnDocument : 'after'});
            if(updatedInfo1.lastErrorObject.n === 0){throw 'could not update course'};
        index += 1;
    }
        const updatedInfo = await userCollection.findOneAndUpdate(
            {_id : new ObjectId(id)},
            {$set : {courses : courseList}},
            {returnDocument : 'after'});
            if(updatedInfo.lastErrorObject.n === 0){throw 'could not update user courses successfully'};
        return aUser;
};

export default {create, getAll, get, remove, update, addCourse, removeCourse, checkUser};
