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
    if(!Array.isArray(professorNames)){throw 'professorNames must be an array';}
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
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'course could not be added to database';
    }
    const insertedcourse = await get(courseCode); //get function for this collection uses the courseCode
    return insertedcourse;
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

export const get = async (courseCode) =>{
    if(!courseCode){throw 'course code!';}
    if(typeof courseCode !== 'string' || courseCode.trim().length === 0){throw 'courseCode must be a non-empty string';}
    courseCode = courseCode.trim();
    const coursesCollection = await courses();
    const aCourse = await coursesCollection.findOne({courseCode: courseCode});
    if(aCourse === null){throw 'no course with that code';}
    aCourse._id = aCourse._id.toString();
    return aCourse;
};

export const remove = async (courseCode) =>{
    if(!courseCode){throw 'courseCode must exist';}
    if(typeof courseCode !== 'string' || courseCode.trim().length === 0){throw 'courseCode must be a non-empty string';}
    courseCode = courseCode.trim();
    const coursesCollection = await courses();
    const deleteInfo = await coursesCollection.findOneAndDelete({
        courseCode: courseCode
    });
    if(deleteInfo.lastErrorObject.n === 0){throw `Could not delete course with code of ${courseCode}`;}
    return `${deleteInfo.value.name} has been successfully deleted!`;
};

export const update = async (
    courseCode,
    name,
    professorNames,
) =>{
    if(!courseCode || !name ||!professorNames){throw 'all inputs must exist!';}
    if(typeof courseCode !== 'string' || typeof name !== 'string' || courseCode.trim().length === 0 || name.trim().length === 0){throw 'All strings must be non-zero inputs';}
    if(!Array.isArray(professorNames)){throw 'professorNames must be an array';}
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
    let check = false;
    let aCourse = await get(courseCode);
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
        {courseCode:courseCode},
        {$set : updatedCourse},
        {returnDocument : 'after'}
    );
    if(updatedInfo.lastErrorObject.n === 0){throw 'could not update course successfully';}
    updatedInfo.value._id = updatedInfo.value._id.toString();
    return updatedInfo.value;
};

export default {create, getAll, get, remove, update};