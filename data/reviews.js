import { users, courses, reviews } from '../config/mongoCollections.js';
import { userData, coursesData } from './index.js'
import {ObjectId} from 'mongodb';

export const create = async(
    courseCode, //should be gotten from the HTML site, I think
    userId,
    reviewText, //can be null
    rating, //rating will be between 1 and 5, no decimals
    // professorName //perhaps name should be within a certain value?
    //comments will be set as an empty array
) =>{
    if(!courseCode || !rating || !userId){throw 'all fields must be present!';}
    if(typeof userId !== 'string' || userId.trim().length === 0 ||typeof courseCode !== 'string' ||  courseCode.trim().length === 0){throw 'all string inputs must be non-empty strings!';}
    //if(typeof rating !== 'number' || rating === NaN){throw 'rating must be a valid number!';}
    //trim strings
    courseCode = courseCode.trim();
    courseCode = courseCode.toLowerCase();
    // professorName = professorName.trim();
    userId = userId.trim();
    // if(professorName.length > 25 || professorName.length < 2){throw 'professor Name has to be at least 2 characters long and less than 25 characters long';}
    if(!ObjectId.isValid(userId)){throw 'userid must be valid!';}
    if(rating > 5 || rating < 1){throw 'rating must be an int between 1 and 5'};
    if(reviewText){ //since reviewText can be null, this is error checking in the case that it is given!
        if(typeof reviewText !== 'string' || typeof reviewText.trim().length === 0){throw 'since review is given, it cannot be an empty string!';}
        reviewText = reviewText.trim();
    }
    let user = undefined;
    let course = undefined;
    let userCollection = await users();
    let coursesCollection = await courses();
    try {
        user = await userData.get(userId);
    } catch (error) {
        throw 'no user with that Id';
    }
    try {
        course = await coursesData.get(courseCode);
    } catch (error) {
        throw 'no course with that Id';
    }
    let check = false;
    let userReviews = user.reviews;
    userReviews.forEach(rev =>{
        if(rev.courseId === courseCode){
            check = true;
        }
    });
    if(check){
        throw 'User already reviewed this course!';
    }

    //dont need to check courses as its array only contains the id's of the reviews
    let newReview = {
        courseId : courseCode,
        userId: userId,
        reviewText : reviewText,
        rating : rating,
        // professorName : professorName,
        // comments : [] comments are not a core feature, so add I guess if needed
    };
    //INSERT IT FIRST INTO REVIEWS COLLECTION, use that ID to insert into other collections
   
    // const review = await reviews.getAll(courseCode)

   
   
   
    const reviewCollection = await reviews();



    //for duplicate reviews 
    // const reviewsList = await reviewCollection.find({}).toArray()

    
    // for (let user of reviewsList)
    // {
    //     if (user.userId == userId && user.courseId === courseCode)
    //     {
    //         throw `Review already exists and cannot add again`
    //     }
    // }
    // // ends here

    const insertInfo = await reviewCollection.insertOne(newReview);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'Review could not be added to its collection';
    }
    const newId = insertInfo.insertedId.toString();
    //now add it to user and courses
    userReviews.push(newReview); //add new Review to user reviews
    const updatedInfo1 = await userCollection.findOneAndUpdate(
        { _id : new ObjectId(userId)},
        {$set : {reviews : userReviews}},
        {returnDocument : 'after'});
        if(updatedInfo1.lastErrorObject.n === 0){throw 'could not add Review to User';}
    
    //add to courses
    let coursesList = course.reviews;
    coursesList.push(newReview);
    const updatedInfo2 = await coursesCollection.findOneAndUpdate(
        {courseCode : courseCode},
        {$set : {reviews : coursesList}},
        {returnDocument : 'after'}
    );
    if(updatedInfo2.lastErrorObject.n === 0){throw 'could not add Review to Course';}
    //have to update the total review of the course now
    let total = 0;
    let len = 0;    
    coursesList.forEach(element =>{
        total += praseInt(element.rating);
        len += 1;
        });
    if(len === 0){
        len = 1;
    }
    let overall = Math.floor(total / coursesList.length * 10) / 10;
    //update the overAll
    const updatedInfo3 = await coursesCollection.findOneAndUpdate(
        {courseCode : courseCode},
        {$set : {rating : overall}},
        {returnDocument : 'after'}
    );
    if(updatedInfo3.lastErrorObject.n === 0){throw 'could not update Overall Rating';}
    //end of create
    return newReview;
};

export const getAll = async(courseCode) =>{
    if(courseCode === undefined || courseCode === null){throw 'courseId must end'};
    if(typeof courseCode !== 'string' || courseCode.trim().length === 0){throw 'id must be a non-empty string';}
    courseCode = courseCode.trim();
    const coursesCollection = await courses();
    const course = await coursesCollection.findOne({courseCode : courseCode});
    if(course === null){throw 'Course does not exist';}
    const list = course.reviews;
    return list;
};

export const get = async(id) =>{
    if(!id){throw 'id must be provided';}
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    const reviewCollection = await reviews();
    const aReview = await reviewCollection.findOne({_id : new ObjectId(id)});
    if(aReview === null){throw 'no review with that id';}
    aReview._id = aReview._id.toString();
    return aReview;
};

export const remove = async (id) => {
    if(!id){throw 'id must exist!';}
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    const reviewCollection = await reviews();
    const userCollection = await users();
    const coursesCollection = await courses();
    //remove either from users or courses first, THEN from reviews
    let aReview = await get(id);
    if(aReview === null){throw 'no review with that Id';}
    let courseCode = aReview.courseId;
    let userId = aReview.userId;
    const deleteInfo1 = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(userId)},{$pull: {reviews : {_id : new ObjectId(id)}}});
    if(deleteInfo1.lastErrorObject.n === 0){throw 'failed to remove Review from User';}
    // user done
    const aCourse = await coursesCollection.findOne({courseCode: courseCode});
        let index = 0;   
    let reviewArr = aCourse.reviews;
        reviewArr.forEach(rev =>{
            if(rev._id.toString() === id){
                reviewArr.splice(index, 1)
            }
            index += 1;
        });
        const deleteInfo2 = await coursesCollection.findOneAndUpdate(
            {courseCode : courseCode},
            {$set : {reviews : reviewArr}});
        if(deleteInfo2.lastErrorObject.n === 0){throw 'failed to remove Review from Courses';}
        //courses "done" deleting
    const deleteInfo3 = await reviewCollection.findOneAndDelete({_id : new ObjectId(id)});
    if(deleteInfo3.lastErrorObject.n === 0){'throw failed to remove review from reviews';}
    //now to update overallRating for courses
    let upCourse = await coursesData.get(courseCode);
    let reviewList = upCourse.reviews;
    let total = 0;
    let len = 0;
    reviewList.forEach(element =>{
        total += element.rating;
        len += 1;
    });
    if(len === 0){
        len = 1; //no /0
    }
    let overall = Math.floor(total / len * 10) / 10;
    //update the overAll
    const updatedInfo3 = await coursesCollection.findOneAndUpdate(
        {courseCode : courseCode},
        {$set : {rating : overall}},
        {returnDocument : 'after'}
    );
    if(updatedInfo3.lastErrorObject.n === 0){throw 'failed to update Courses overallRating';}
    return `${deleteInfo3.value._id} has been successfully deleted!`; 
};

export default {create, getAll, get, remove};