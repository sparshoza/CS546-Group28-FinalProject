import { users, emails, courses } from "../config/mongoCollections.js";
import bcrypt from 'bcrypt';
const saltRounds = 3;
import {ObjectId} from 'mongodb';

export const create = async(
    //fields of input here
    firstName, // does the size need to  be checked
    lastName,  // does the size need to be checked
    stevensEmail, //find duplicates of the email //NO DUPLICATES
    hashedPassword, //has to be hashed here 
    profilePicture, //will it be a link?
    courses, //INPUT IS AN ARRAY CONTAINING THE LOWER PARTS
    // department, //only supports CS right now
    // courseNumber, //must be a number
    graduationYear 
    //reviews and comment will be set to empty arrays, since a new account has done neither.
) =>{
    if(!firstName || !lastName || !department || !stevensEmail || !hashedPassword || !profilePicture || !graduationYear){throw 'all fields must be present';}
    if(typeof firstName !== 'string' ||typeof department !== 'string'|| typeof lastName !== 'string' || typeof stevensEmail !== 'string' || typeof hashedPassword !== 'string' || typeof profilePicture !== 'string' ||firstName.trim().length === 0 || department.trim().length === 0 || lastName.trim().length === 0 || stevensEmail.trim().length === 0 || profilePicture.trim().length === 0 || hashedPassword.trim().length === 0){throw 'all string inputs must be non-empty strings!';}
    if(typeof graduationYear !== 'number' || graduationYear === NaN || courseNumber !== 'number' || courseNumber === NaN){throw "graduationYear must be a non-zero number";}
    //trim the strings
    firstName = firstName.trim();
    lastName = lastName.trim();
    stevensEmail = stevensEmail.trim().toLowerCase(); //stored as lowercase string
    department = department.trim();
    hashedPassword = hashedPassword.trim();
    profilePicture = profilePicture.trim();
    if(department !== 'CS'){throw 'Only CS department is support right now';}
    //The regex statement below replaces all non-alphabetical characters with blank spaces, leaving only non-alphabetical characters
    if(firstName.replace(/[a-z]/gi, "").length !== 0 || lastName.replace(/[a-z]/gi, "").length !== 0){throw 'First and Last name can only contain letters!';}
    //if(stevensEmail.substring(stevensEmail.length -12) !== "@stevens.edu" || (stevensEmail[0] !== firstName.toLowerCase()) || stevensEmail.substring(1, lastName.length + 1) != lastName.toLowerCase()){throw "Stevens Email must follow format";}
    if(stevensEmail.substring(stevensEmail.length -12) !== "@stevens.edu"){throw "Stevens Email must follow format";}
    // if(website.substring(0,11) !== "http://www." || website.substring(website.length -4) !== ".com" || website.substring(11, website.length -4).trim().length < 5){throw "website must be a valid website!";} should we check url
    const date = new Date();
    if(graduationYear < date.getFullYear() || graduationYear > date.getFullYear() + 5){throw 'Date must be between current year and 5 in the future';}
    const userCollection = await users();
    // let hashedPassword = await bcrypt.hash(password, saltRounds);
    const aUser = await userCollection.findOne({stevensEmail : stevensEmail});
    if(aUser !== null){throw 'Email is already linked to an account!'};
    let emailCollection = await emails();
    let valid = await emailCollection.findOne({email : stevensEmail});
    if(valid === null){throw 'Email is not a valid stevens email address!'};
    let courseCollection = await courses();
    let validCourse = await courseCollection.findOne({number : courseNumber});
    if(validCourse !== null){throw 'course number is not a valid number!'};
    let newUser = {
        firstName: firstName,
        lastName: lastName,
        stevensEmail: stevensEmail,
        password: hashedPassword,
        profilePicture: profilePicture,
        department: department,
        graduationYear,
        reviews: [], //empty
        comments: [] //empty
    };
    const insertInfo = await userCollection.insertOne(newUser);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'User could not be added';
    }
    const newId = insertInfo.insertedId.toString();
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

export const update = async (
    id,
    firstName,
    lastName,
    stevensEmail, 
    hashedPassword, //has to be unhashed
    profilePicture, 
    department, 
    graduationYear 
) =>{
    if(!id || !firstName || !lastName || !department || !stevensEmail || !hashedPassword || !profilePicture || !graduationYear){throw 'all fields must be present';}
    if(typeof id !== 'string' || id.trim().length === 0 || typeof firstName !== 'string' ||typeof department !== 'string'|| typeof lastName !== 'string' || typeof stevensEmail !== 'string' || typeof hashedPassword !== 'string' || typeof profilePicture !== 'string' ||firstName.trim().length === 0 || department.trim().length === 0 || lastName.trim().length === 0 || stevensEmail.trim().length === 0 || profilePicture.trim().length === 0 || hashedPassword.trim().length === 0){throw 'all string inputs must be non-empty strings!';}
    if(typeof graduationYear !== 'number' || graduationYear === NaN){throw "graduationYear must be a non-zero number";}
    //trim the strings
    id = id.trim();
    firstName = firstName.trim();
    lastName = lastName.trim();
    stevensEmail = stevensEmail.trim();
    department = department.trim();
    hashedPassword = hashedPassword.trim();
    profilePicture = profilePicture.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    if(department === 'CS'){throw 'Only CS department is support right now';}
    //The regex statement below replaces all non-alphabetical characters with blank spaces, leaving only non-alphabetical characters
    if(firstName.replace(/[a-z]/gi, "").length !== 0 || lastName.replace(/[a-z]/gi, "").length !== 0){throw 'First and Last name can only contain letters!';}
    if(stevensEmail.substring(stevensEmail.length -12) !== "@stevens.edu" || (stevensEmail[0] !== firstName.toLowerCase()) || stevensEmail.substring(1, lastName.length + 1) != lastName.toLowerCase()){throw "Stevens Email must follow format";}
    // if(website.substring(0,11) !== "http://www." || website.substring(website.length -4) !== ".com" || website.substring(11, website.length -4).trim().length < 5){throw "website must be a valid website!";} should we check url
    const date = new Date();
    if(graduationYear < date.getFullYear() || graduationYear > date.getFullYear() + 5){throw 'Date must be between current year and 5 in the future';}
    const userCollection = users();
    let users = await getAll();
    //check now to see if a field has changed
    let preUp = await get(id);
    //UNHASH THE PASSWORD HERE
    if(preUp.firstName !== firstName || preUp.lastName !== lastName || preUp.stevensEmail !== stevensEmail || preUp.department !== department || preUp.hashedPassword !== hashedPassword || preUp.profilePicture !== profilePicture || preUp.graduationYear !== graduationYear) {throw 'at least one field must have changed!';}
    let updatedUser = {
        firstName: firstName,
        lastName : lastName,
        stevensEmail : stevensEmail, 
        hashedPassword : hashedPassword, //IT MUST BE HASHED BEFORE THIS
        profilePicture : profilePicture, 
        department : department, 
        graduationYear 
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
    let anEmail = emails.findONe({email : emailAddress});
    if(anEmail === null){'this is not a valid email'};
    //password check
    let upperCheck = /[A-Z]/;
    let numberCheck = /[0-9]/;
    let specialCheck = /[!@#$%^&*-?]/; //allows for the special characters in number row and ?
    if(!password.match(upperCheck) || !password.match(numberCheck) || !password.match(specialCheck)){throw 'password must contain at least one uppercase letter, one number and one special character';}
    //validating done
    const userCollection = await users();
    const aUser = await userCollection.findOne({emailAddress : emailAddress}); //ask TA?
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
      return new_user;
    } else {
      throw 'Either the email address or password is incorrect';
    }
  };

export default {create, getAll, get, remove, update, checkUser};