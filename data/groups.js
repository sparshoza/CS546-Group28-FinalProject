import {groups} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';

export const create = async(
    courseId,
    groupName,
    groupMembers
) => {
    if(!courseId || !groupName || !groupMembers){throw 'all inputs must exist!';}
    if(typeof courseId !== 'string' || typeof groupName !== 'string' || courseId.trim().length === 0 || groupName.trim().length === 0){throw 'string inputs must be non-empty strings!';}
    //trim the strings
    courseId = courseId.trim();
    groupName = groupName.trim();
    if(!ObjectId.isValid(courseId)){throw 'courseId must be valid!';}
    if(!groupMembers.isArray()){throw 'groupMembers must be an array!';}
    if(groupMembers.length === 0){throw 'groupMembers cannot be empty!';}
    let index = 0;
    groupMembers.forEach(element =>{
        if(typeof element !== 'string' || element.trim().length === 0){throw 'each group member must be a non-empty string';}
        groupMembers[index] = element.trim(); //trim the strings
    });
    const groupCollection = await groups();
    //check for duplicate groupName
    const groups = await getAllNuCourse(courseId);
    groups.forEach(group =>{
        if(group.groupName === groupName){throw 'already a group with this name!';}
    });

    let newGroup = {
        courseId : courseId,
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

export const getAllByCourse = async (courseId) =>{
    if(!courseId){throw 'courseId must be provided!';}
    if(typeof courseId !== 'string' || courseId.trim().length === 0){throw 'courseId must be a non-empty string';}
    if(!ObjectId.isValid(courseId)){throw 'courseId must be a valid Id!';}
    let groupList = await groupCollection.find({courseId: courseId}).toArray();
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


export const update = async(
    id,
    courseId,
    groupName,
    groupMembers
) => {
    if(!id || !courseId || ! groupMembers || !groupName){throw 'all fields must be given!';}
    if(typeof id !== 'string'  || typeof courseId !== 'string' || typeof groupName !== 'string' || id.trim().length === 0 || groupName.trim().length === 0 || courseId.trim().length === 0){throw 'all string inputs must be non-empty strings!';}
    //trim strings
    id = id.trim();
    courseId = courseId.trim();
    groupName = groupName.trim();
    if(!ObjectId.isValid(id) || !ObjectId.isValid(courseId)){throw 'ids must be valid!';}
    if(!groupMembers.isArray()){throw 'groupMembers must be an array!';}
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
    if(aGroup.courseId !== courseId || aGroup.groupName !== groupMembers){check = true;}
    aGroup.groupMembers.forEach(element =>{
        if(element !== aGroup.groupMembers[index]){check = true};
        index += 1;
    });
    if(!check){throw 'no elements have been changed!';}
    let upGroup = {
        courseId : courseId,
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
};


export default {create, getAllByCourse, get, remove, update};