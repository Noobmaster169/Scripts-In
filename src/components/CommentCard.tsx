import Image from 'next/image'
import React, { useState, useRef } from 'react'
import { AiFillHeart } from 'react-icons/ai';
import { IoShareSocialSharp } from "react-icons/io5";
import { IoEllipsisHorizontal } from "react-icons/io5";

const placeholderComments = [
  {
    _id: "b3a2d1c4e5f6g7h8i9j0k",
    username: "Anonymous",
    usertag: "uB85aVoa5n239jaA89Vmalo17LIf4",
    commentText: "This is awesome!",
    timeSincePost: "2h",
    likes: 652,
    shares: 89
  },
  {
    _id: "l9m8n7o6p5q4r3s2t1u",
    username: "Anonymous",
    usertag: "aB93cVoZ5p23jzA8Vmalp17LIg8uY85a6n249k90man8LJf9vC9dVob759C1Xmao19LK",
    commentText: "Lenovo Yoga Pro 7 is the best laptop I've ever used!",
    timeSincePost: "49m",
    likes: 428,
    shares: 51
  },
  {
    _id: "v1w2x3y4z5a6b7c8d9e",
    username: "Anonymous",
    usertag: "uY85bVoa6n249kaB90Wmano18LJf9",
    commentText: "We love Monash University Malaysia! The best University I have ever seen!",
    timeSincePost: "28d",
    likes: 129,
    shares: 40
  },
  {
    _id: "f9g8h7i6j5k4l3m2n1o",
    username: "Anonymous",
    usertag: "vC95dVob7o259lbC91Xmaoo19LKg0",
    commentText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Commodo odio aenean sed adipiscing diam donec adipiscing tristique risus. Tincidunt eget nullam non nisi est sit amet. Sollicitudin ac orci phasellus egestas. Ac orci phasellus egestas tellus rutrum tellus. Blandit aliquam etiam erat velit scelerisque. Venenatis tellus in metus vulputate eu scelerisque felis imperdiet. Ut ornare lectus sit amet est placerat in egestas.",
    timeSincePost: "5mo",
    likes: 4,
    shares: 1
  },
]

const CommentCard = () => {
  const commentRef = useRef(null);
  const [comment, setComment] = useState<string>("");

  // Usestates only for placeholder and demonstration, remove when using real data and database
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set()); // use set for quick add and delete
  const [likes, setLikes] = useState<{ [key: string]: number }>(
    placeholderComments.reduce((acc, comment) => {
      acc[comment._id] = comment.likes;
      return acc;
    }, {})
  );

  const toggleLike = (id: string) => {
    const newLikedComments = new Set(likedComments);
    const newLikes = { ...likes };

    if (newLikedComments.has(id)) {
      newLikedComments.delete(id);
      newLikes[id] -= 1;
    } else {
      newLikedComments.add(id);
      newLikes[id] += 1;
    }

    setLikedComments(newLikedComments);
    setLikes(newLikes)
  };

  const handleTextAreaChange = (e: any) => {
    setComment(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const clearTextArea = () => {
    commentRef.current.value = "";
    setComment("");
  };

  const handleCommentSubmitClick = () => {
    // TODO: Implement comment submission logic
    console.log("Comment submitted:", commentRef.current.value);
    clearTextArea();
  }

  return (
    <div className="flex flex-col justify-center rounded-md border-[#3c3c3c] border-2 max-w-[800px] bg-[#1e1e1e] shadow-lg">
      {/* Create Comment */}
      <div className="flex items-start border-b border-[#3c3c3c] border-1 gap-5 py-5">
        {/* Profile Picture */}
        <Image
          src="/favicon.ico"
          alt="Profile Picture"
          width={50}
          height={50}
          className="rounded-full ml-5 object-contain"
        />

        {/* Text area & Post button section */}
        <div className="flex flex-col w-full mr-5 gap-5">
          {/* Comment Input */}
          <div>
            <textarea
              ref={commentRef}
              placeholder="Add a comment..."
              className="w-full text-[#b9b9b9] bg-transparent appearance-none rounded-lg px-3.5 py-2.5 outline-none focus:ring-0 focus:border-b-2 focus:border-[#3c3c3c] text-lg whitespace-normal resize-none"
              onChange={handleTextAreaChange}
              rows={1}
            />
          </div>

          {/* Submit Button */}
          {( comment !== "" ) &&
            <div className="flex justify-end gap-3">
              <button className="bg-transparent text-white p-2 font-bold text-md rounded-md" onClick={clearTextArea}>Cancel</button>
              <button className="bg-[#e6007e] text-white p-2 font-bold text-md rounded-md" onClick={handleCommentSubmitClick}>Comment</button>
            </div>
          }
        </div>
      </div>

      {/* Display Comments */}
      {placeholderComments.map((comment, index) => (
        <div className="flex justify-between py-5">
          <div className="flex items-start border-b border-[#3c3c3c] border-1 gap-5 max-w-full">
            {/* Profile Picture */}
            <Image
              src="/favicon.ico"
              alt="Profile Picture"
              width={50}
              height={50}
              className="rounded-full ml-5 object-contain"
            />
    
            {/* Text, Like, & Share button */}
            <div className="flex flex-col w-full mr-5 max-w-full px-3.5">
              {/* Username, usertag, and time since post */}
              <div className="flex items-center gap-2">
                <p className="text-[#cecece]text-left font-bold">{comment.username}</p>
                <p className="text-[#b9b9b9] max-w-md truncate">@{comment.usertag}</p>
                <div className="bg-[#b9b9b9] h-1 w-1 rounded-full"></div>
                <p className="text-[#b9b9b9]">{comment.timeSincePost}</p>
              </div>
              {/* Comment Text */}
              <div className="flex justify-start">
                <p className="text-[#cecece] text-left">{comment.commentText}</p>
              </div>
    
              {/* Like & Share Button */}
              <div className="flex mt-4 items-center gap-5">
                <div className="flex gap-2 cursor-pointer items-center" onClick={() => toggleLike(comment._id)}>
                  {likedComments.has(comment._id) ? (
                    <AiFillHeart className="text-[#e6007e] text-lg" />
                  ) : (
                    <AiFillHeart className="text-[#cecece] text-lg" />
                  )}
                  <p className="text-sm font-bold mb-[1px]">{likes[comment._id]}</p>
                </div>
                <div className="flex gap-2 cursor-pointer items-center">
                  <IoShareSocialSharp className="text-[#cecece] text-lg" />
                  <p className="text-sm font-bold mb-[1px]">{comment.shares}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ellipsis */}
          <div>
            <IoEllipsisHorizontal className="text-[#cecece] text-lg mr-5 cursor-pointer" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default CommentCard