import { users, groups, courses } from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';

export const create = async(
    courseCode,
    groupName,
    groupMembers
) => {
    if(!courseCode || !groupName || !groupMembers){throw 'all inputs must exist!';}
    if(typeof courseCode !== 'string' || typeof groupName !== 'string' || courseCode.trim().length === 0 || groupName.trim().length === 0){throw 'string inputs must be non-empty strings!';}
    //trim the strings
    courseCode = courseCode.trim();
    groupName = groupName.trim();
    if(!Array.isArray(groupMembers)){throw 'groupMembers must be an array!';}
    const courseCollection = await courses();
    const aCourse = await courseCollection.findOne({courseCode : courseCode});
    if(aCourse === null){throw 'invalid course code!';}
    if(groupMembers.length === 0){throw 'groupMembers cannot be empty!';}
    let index = 0;
    let toValidate = [];
    groupMembers.forEach(element =>{
        if(typeof element !== 'string' || element.trim().length === 0){throw 'each group member must be a non-empty string';}
        groupMembers[index] = element.trim(); //trim the strings
        element = element.trim();
        if(!ObjectId.isValid(element)){
            throw 'each member must be a valid user ID'
        }
        toValidate[index] = element;
        index += 1;
    });
    index = 0;
    const userCollection = await users();
    while(index < toValidate.length){
        let aUser = await userCollection.findOne({_id : new ObjectId(toValidate[index])});
        if(aUser === null){throw 'no user with id of ' + toValidate[index];}
        index += 1;
    }
    const groupCollection = await groups();
    //check for duplicate groupName
    const allGroups = await getAllByCourse(courseCode);
    allGroups.forEach(group =>{
        if(group.groupName === groupName){throw 'already a group with this name!';}
    });

    let newGroup = {
        courseCode : courseCode,
        groupName : groupName,
        groupMembers : groupMembers
    };

    const insertInfo = await groupCollection.insertOne(newGroup);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'Group could not be added';
    }
    const newId = insertInfo.insertedId.toString();
    const group = await get(newId);
    return group;
};

export const getAllByCourse = async (courseCode) =>{
    if(!courseCode){throw 'courseCode must be provided!';}
    if(typeof courseCode !== 'string' || courseCode.trim().length === 0){throw 'courseCode must be a non-empty string';}
    courseCode = courseCode.trim();
    let groupCollection = await groups();
    let groupList = await groupCollection.find({courseCode: courseCode}).toArray();
    if(!groupList){throw 'could not get all groups';}
    groupList = groupList.map((element) =>{
        element._id = element._id.toString();
        return element;
    });
    return groupList;
};

//TODO another getAll by userId?

export const get = async (id) =>{
    if(!id){throw 'id must exist!';}
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    const groupCollection = await groups();
    const aGroup = await groupCollection.findOne({_id : new ObjectId(id)});
    if(aGroup === null){throw 'no user with that id';}
    aGroup._id = aGroup._id.toString();
    return aGroup;
};

export const remove = async (id) =>{
    if(!id){throw 'id must exist!';}
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    const groupCollection = await groups();
    const deleteInfo = await groupCollection.findOneAndDelete({
        _id: new ObjectId(id)});
    if(deleteInfo.lastErrorObject.n === 0){throw `Could not delete group with id of ${id}`;}
    return `${deleteInfo.value.name} has been successfully deleted!`; 
};

//not going to be used to add or remove group members
export const update = async(
    id,
    courseCode,
    groupName,
    groupMembers
) => {
    if(!id || !courseCode || ! groupMembers || !groupName){throw 'all fields must be given!';}
    if(typeof id !== 'string'  || typeof courseCode !== 'string' || typeof groupName !== 'string' || id.trim().length === 0 || groupName.trim().length === 0 || courseCode.trim().length === 0){throw 'all string inputs must be non-empty strings!';}
    //trim strings
    id = id.trim();
    courseCode = courseCode.trim();
    groupName = groupName.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    if(!Array.isArray(groupMembers)){throw 'groupMembers must be an array!';}
    const courseCollection = await courses();
    let aCourse = await courseCollection.findOne({courseCode : courseCode});
    if(aCourse === null){throw 'courseCode is invalid';}
    let index = 0;
    if(groupMembers.length === 0){throw 'group members cannot be empty!';}
    groupMembers.forEach(element =>{
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all group members must be non-empty strings!';}
    });
    //check now to see if anything changed
    const groupCollection = await groups();
    let aGroup = await get(id);
    let check = false;
    index = 0;
    if(aGroup.groupMembers.length !== groupMembers.length){check = true};
    if(aGroup.courseCode !== courseCode || aGroup.groupName !== groupName){check = true;}
    console.log(check);
    aGroup.groupMembers.forEach(element =>{
        if(element !== aGroup.groupMembers[index]){check = true};
        index += 1;
    });
    if(!check){throw 'no elements have been changed!';}
    let upGroup = {
        courseCode : courseCode,
        groupName : groupName,
        groupMembers :groupMembers
    };
    const updatedInfo = await groupCollection.findOneAndUpdate(
        {_id : new ObjectId(id)},
        {$set : upGroup},
        {returnDocument : 'after'}
    );
    if(updatedInfo.lastErrorObject.n === 0){throw 'could not update group successfully!';}
    updatedInfo.value._id = updatedInfo.value._id.toString();
    return updatedInfo.value;
};

export const addMember = async (id, userId) =>{
    if(!id || !userId){throw 'ids must exist!';}
    if(typeof id !== 'string' || id.trim().length === 0 || typeof userId !=='string' || userId.trim().length === 0){throw 'ids must be non-empty strings!';}
    id = id.trim();
    userId = userId.trim();
    if(!ObjectId.isValid(id) || !ObjectId.isValid(userId)){throw 'ids must be valid!';}
    const groupCollection = await groups();
    const userCollection = await users();
    let aGroup = await groupCollection.findOne({_id : new ObjectId(id)});
    if(aGroup === null){throw 'no group with this id';}
    let aUser = await userCollection.findOne({_id : new ObjectId(userId)});
    if(aUser === null){throw 'no user with this id';}
    let memberList = aGroup.groupMembers;
    memberList.forEach(member => {
        if(member === userId){throw 'member already in this group!';}
    });
    memberList.push(userId);
    const updatedInfo = await groupCollection.findOneAndUpdate(
        {_id : new ObjectId(id)},
        {$set : {groupMembers : memberList}},
        {returnDocument : 'after'});
        if(updatedInfo.lastErrorObject.n === 0){ throw 'could not update groups successfully';}
        updatedInfo.value._id = updatedInfo.value._id.toString();
        return updatedInfo.value;
};

export const removeMember = async(id, userId) =>{
    if(!id || !userId){throw 'ids must exist!';}
    if(typeof id !== 'string' || id.trim().length === 0 || typeof userId !=='string' || userId.trim().length === 0){throw 'ids must be non-empty strings!';}
    id = id.trim();
    userId = userId.trim();
    if(!ObjectId.isValid(id) || !ObjectId.isValid(userId)){throw 'ids must be valid!';}
    const groupCollection = await groups();
    const userCollection = await users();
    let aGroup = await groupCollection.findOne({_id : new ObjectId(id)});
    if(aGroup === null){throw 'no group with this id';}
    let aUser = await userCollection.findOne({_id : new ObjectId(userId)});
    if(aUser === null){throw 'no user with this id';}
    let memberList = aGroup.groupMembers;
    let check = 0;
    let index = 0;
    memberList.forEach(member => {
        if(member === userId){
            check = true;
            memberList.splice(index, 1);
        }
    });
    if(!check){throw 'user is not in this group!';}
    if(memberList.length === 0){ 
        let returnVal = await remove(id);
        return 'No more members in this group, the group has been removed!'}
    const updatedInfo = await groupCollection.findOneAndUpdate(
        {_id : new ObjectId(id)},
        {$set : {groupMembers : memberList}},
        {returnDocument : 'after'});
        if(updatedInfo.lastErrorObject.n === 0){ throw 'could not update groups successfully';}
        updatedInfo.value._id = updatedInfo.value._id.toString();
        return updatedInfo.value;
};

export default {create, getAllByCourse, get, remove, update, addMember, removeMember};