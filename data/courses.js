import {courses} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';


export const create = async(
    courseCode,
    name,
    professorNames,
    //need to contain a list of the people in the course
    //rating is initially 0;
    //reviews is initially an empty list
    //initially has nobody in the class
) =>{
    if(!courseCode || !name || !professorNames){throw 'all inputs must exist!';}
    if(typeof courseCode !== 'string' || typeof name !== 'string' || courseCode.trim().length === 0 || name.trim().length === 0){throw 'All strings must be non-zero inputs';}
    if(!professorNames.isArray()){throw 'professorNames must be an array';}
    if(professorNames.length === 0){throw 'professorNames must not be empty!';}
    //trim strings
    courseCode = courseCode.trim();
    name = name.trim();
    let index = 0;
    professorNames.forEach(element =>{
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all professor names must be nonempty strings!';}
        professorNames[index] = element.trim();
        index += 1;
    });
    let newCourse = {
        courseCode : courseCode,
        name : name,
        professorNames , professorNames,
        students : [],
        rating : 0,
        reviews : []
    };
    const coursesCollection = await courses();
    const insertInfo = await coursesCollection.insertOne(newCourse);
    const newId = insertInfo.insertedId.toString();
    const course = await get(newId);
    return course;
};

export const getAll = async () =>{
    const coursesCollection = await courses();
    let coursesList  = coursesCollection.find({}).toArray();
    if(!coursesList){throw 'could not find all courses';}
    coursesList = coursesList.map((element) =>{
        element._id = element._id.toString();
        return element;
    });
    return coursesList;
};

export const get = async (id) =>{
    if(!id){throw 'id must exist!';}
    if(typeof id !== 'string' || id.trim().length !== 0){throw 'id must be a non-empty string';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    const coursesCollection = await courses();
    const aCourse = await coursesCollection.findONe({_id: new ObjectId(id)});
    if(aCourse === null){throw 'no course with that id';}
    aCourse._id = aCourse._id.toString();
    return aCourse;
};

export const remove = async (id) =>{
    if(!id){throw 'id must exist';}
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid';}
    const coursesCollection = await courses();
    const deleteInfo = await coursesCollection.findOneAndDelete({
        _id: new ObjectId(id)
    });
    if(deleteInfo.lastErrorObject.n === 0){throw `Could not delete course with id of ${id}`;}
    return `${deleteInfo.value.name} has been successfully deleted!`;
};

export const update = async (
    id,
    courseCode,
    name,
    professorNames,
) =>{
    if(!id || !courseCode || !name ||!professorNames){throw 'all inputs must exist!';}
    if(typeof courseCode !== 'string' || typeof name !== 'string' || courseCode.trim().length === 0 || name.trim().length === 0){throw 'All strings must be non-zero inputs';}
    if(!professorNames.isArray()){throw 'professorNames must be an array';}
    if(professorNames.length === 0){throw 'professorNames must not be empty!';}
    //trim strings
    id = id.trim();
    courseCode = courseCode.trim();
    name = name.trim();
    let index = 0;
    professorNames.forEach(element =>{
        if(typeof element !== 'string' || element.trim().length === 0){throw 'all professor names must be nonempty strings!';}
        professorNames[index] = element.trim();
        index += 1;
    });
    let check = false;
    let aCourse = await get(id);
    index = 0;
    if(aCourse.courseCode !== courseCode || aCourse.name !== name){check = true;}
    if(professorNames.length !== aCourse.professorNames.length){check = true;} //if there are more or less professors
    professorNames.forEach(element =>{ //doesn't account for adding or removing professors
        if(element = aCourse.professorNames[index]){check = true;}
        index += 1;
    });
    if(!check){throw 'at least one element must be different!';}
    let updatedCourse = {
        courseCode: courseCode,
        name : name,
        professorNames: professorNames
    };
    const updatedInfo = await coursesCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$set : updatedCourse},
        {returnDocument : 'after'}
    );
    if(updatedInfo.lastErrorObject.n === 0){throw 'could not update course successfully';}
    updatedInfo.value._id = updatedInfo.value._id.toString();
    return updatedInfo.value;
};

export default {create, getAll, get, remove, update};