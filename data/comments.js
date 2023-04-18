import { comments, users } from "../config/mongoCollections.js";
import {userData, reviewData} from "./index.js"
import {ObjectId} from 'mongodb';


export const createUserComment = async(
    commentText,
    commentAuthor, //userId
    commentPlace //reviewId
) => {
    if(!commentAuthor || !commentText || !commentPlace){throw 'all inputs must be present!';}
    if(typeof commentPlace !== 'string' || commentPlace.trim().length === 0||typeof commentText !== 'string' || typeof commentAuthor !== 'string' || commentAuthor.trim().length === 0 || commentText.trim().length === 0){throw 'inputs must be non-empty strings!';}
    //trim strings
    commentAuthor = commentAuthor.trim();
    commentText = commentText.trim();
    commentPlace = commentPlace.trim();
    if(!ObjectId.isValid(commentAuthor) || !ObjectId.isValid(commentPlace)){throw 'commentAuthor must be a valid id!';}
    let newComment = {
        commentAuthor: commentAuthor,
        commentText : commentText,
        commentPlace : commentPlace
    };
    const commentCollection = await comments();
    const insertInfo = await commentCollection.insertOne(newComment);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'Comment could not be added';
    }
    const newId = insertInfo.insertedId.toString();
    //insert id to review and to user
    const userCollection = await users();
    const reviewCollection = await reviews();
    const user = await userData.get(commentAuthor);
    let newList = user.comments;
    newList.push(newId.toString()); //added to User
    const insertInfo2 = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(commentAuthor)},
        {$set : {comments: newList}},
        {returnDocument : 'after'}
    );
    if(!insertInfo2.acknowledged || !insertInfo2.insertedId){
        throw 'Comment could not be added to user';
    }
    let aReview = await reviewData.get(commentPlace);
    newList = aReview.comments;
    newList.push(newId);
    const insertInfo3 = await reviewCollection.findOneAndUpdate(
        {_id: new ObjectId(commentPlace)},
        {$set : {comments : newList}},
        {returnDocumnet: 'after'}
    );
    if(!insertInfo3.acknowledged || !insertInfo2.insertedId){
        throw 'Comment could not be added to review';
    }
    const comment = await get(newId);
    return comment;
};


export const getAllUser = async (userId) => {
    if(!userId){throw 'userId must be provided';}
    if(typeof userId !== 'string' || userId.trim().length === 0){throw 'userId must be a non-empty string!'};
    userId = userId.trim();
    const userCollection = await users();
    const aUser = await userData.get(userId);
    return aUser.comments;
};

export const getAllReview = async (reviewId) => {
    if(!reviewId){throw 'reviewId must be provided';}
    if(typeof reviewId !== 'string' || reviewId.trim().length === 0){throw 'reviewId must be a non-empty string!'};
    reviewId = reviewId.trim();
    const reviewCollection = await reviews();
    const aReview = await userData.get(reviewId);
    return aReview.comments;
};

export const get = async (id) =>{
    if(!id){throw 'id must exist!';}
    if(typeof id !== 'string' || id.trim().length !== 0){throw 'id must be a non-empty string';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    const commentsCollection = await comments();
    const comment = await commentsCollection.findONe({_id: new ObjectId(id)});
    if(comment === null){throw 'no course with that id';}
    comment._id = comment._id.toString();
    return comment;
};

export const remove = async (id) => {
    if(!id){throw 'id must exist!';}
    if(typeof id !== 'string' || id.trim().length === 0){throw 'id must be a non-empty string!';}
    id = id.trim();
    if(!ObjectId.isValid(id)){throw 'id must be valid!';}
    const commentCollection = await comments();
    const commentTBD = await get(id); //comment to be deleted
    const deleteInfo = await commentCollection.findOneAndDelete({
        _id: new ObjectId(id)});
    if(deleteInfo.lastErrorObject.n === 0){throw `Could not delete comment with id of ${id}`;}
    //remove from users and reviews, first user
    let aUser = await userData.get(commentTBD.commentAuthor);
    let newList = [];
    let index = 0;
    let list = aUser.comments;
    list.forEach(comment =>{
        if(comment !== id){
            newList[index] = comment;
            index += 1;
        }
    });
    const insertInfo = userCollection.findOneAndUpdate(
        {_id: commentTBD.commentAuthor},
        {set: {comments: newList}},
        {returnDocument : 'after'}
    );
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'Comment could not be added to user';
    }
    let aReview = await reviewData.get(commentTBD.commentPlace);
    newList = [];
    index = 0;
    list = aReview.comments;
    list.forEach(comment =>{
        if(comment !== id){
            newList[index] = comment;
            index += 1;
        }
    });
    const insertInfo2 = reviewCollection.findOneAndUpdate(
        {_id: commentTBD.commentAuthor},
        {set: {comments: newList}},
        {returnDocument : 'after'}
    );
    if(!insertInfo2.acknowledged || !insertInfo2.insertedId){
        throw 'Comment could not be added to review';
    }
    return `${deleteInfo.value.name} has been successfully deleted!`; 
};



export default {createUserComment, getAllUser, getAllReview, get, remove};