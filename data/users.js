import { users } from "../config/mongoCollections";
import {ObjectId} from 'mongodb';

export const create = async(
    //fields of input here
    firstName, // does the size need to  be checked
    lastName,  // does the size need to be checked
    stevensEmail, //find duplicates of the email //NO DUPLICATES
    hashedPassword, //has to be hashed here 
    profilePicture, //will it be a link?
    department, //only supports CS right now
    graduationYear 
    //reviews and comment will be set to empty arrays, since a new account has done neither.
) =>{
    if(!firstName || !lastName || !department || !stevensEmail || !hashedPassword || !profilePicture || !graduationYear){throw 'all fields must be present';}
    if(typeof firstName !== 'string' ||typeof department !== 'string'|| typeof lastName !== 'string' || typeof stevensEmail !== 'string' || typeof hashedPassword !== 'string' || typeof profilePicture !== 'string' ||firstName.trim().length === 0 || department.trim().length === 0 || lastName.trim().length === 0 || stevensEmail.trim().length === 0 || profilePicture.trim().length === 0 || hashedPassword.trim().length === 0){throw 'all string inputs must be non-empty strings!';}
    if(typeof graduationYear !== 'number' || graduationYear === NaN){throw "graduationYear must be a non-zero number";}
    //trim the strings
    firstName = firstName.trim();
    lastName = lastName.trim();
    stevensEmail = stevensEmail.trim();
    department = department.trim();
    hashedPassword = hashedPassword.trim();
    profilePicture = profilePicture.trim();
    if(department === 'CS'){throw 'Only CS department is support right now';}
    //The regex statement below replaces all non-alphabetical characters with blank spaces, leaving only non-alphabetical characters
    if(firstName.replace(/[a-z]/gi, "").length !== 0 || lastName.replace(/[a-z]/gi, "").length !== 0){throw 'First and Last name can only contain letters!';}
    if(stevensEmail.substring(stevensEmail.length -12) !== "@stevens.edu" || (stevensEmail[0] !== firstName.toLowerCase()) || stevensEmail.substring(1, lastName.length + 1) != lastName.toLowerCase()){throw "Stevens Email must follow format";}
    // if(website.substring(0,11) !== "http://www." || website.substring(website.length -4) !== ".com" || website.substring(11, website.length -4).trim().length < 5){throw "website must be a valid website!";} should we check url
    const date = new Date();
    if(graduationYear < date.getFullYear() || graduationYear > date.getFullYear() + 5){throw 'Date must be between current year and 5 in the future';}
    const userCollection = users();
    let users = await getAll();
    let check = false;
    users.forEach(acct =>{
        if(acct.stevensEmail === stevensEmail){
           check = true; 
        }
    });
    if(check){
        throw 'Email already exists in another account!';
    }
    let newUser = {
        firstName: firstName,
        lastName: lastName,
        stevensEmail: stevensEmail,
        hashedPassword: hashedPassword,
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

export default {create, getAll, get, remove, update};