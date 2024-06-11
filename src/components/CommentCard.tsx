import React, { useState, useRef, use, useEffect, useMemo} from 'react';
import { generateRandomNumber } from '../utils/ipfs';
import * as anchor from '@project-serum/anchor';
import { useRouter } from 'next/router';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getPostById, getAccount, getUser} from "../anchor/blog_setup";
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { BlogIDL } from "../anchor/blog_idl";
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { notify } from "../utils/notifications";
import styled from 'styled-components';
import Image from 'next/image';
import dynamic from 'next/dynamic'

const CONTRACT_ADDRESS = new PublicKey(BlogIDL.metadata.address);
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export const CommentCard = ({id})=>{
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const [user, setUser] = useState<any>();
  const [counter, setCounter] = useState(0);
  const [res, setRes] = useState<any>(<>Hello</>);
  const addCounter = ()=>{setCounter(counter +1);}

  const route = useRouter();
    const createAccount = () =>{
      route.push(`/new`)
  }
  
  const getComments = async ()=>{
    const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions())
    const program =  new anchor.Program<any>(BlogIDL, CONTRACT_ADDRESS, provider)
    if (program && wallet){
      const user:any = await getUser(wallet, program);
      if(user){
        const {users_data} = await getAccount(wallet,program, user);
        
        const filtered_data = users_data.filter((item) => item.account.title === id.toString())
        const refined_data = [];
        for(const comment of filtered_data){
          const postUser = await getUser(wallet, program, comment.account.authority);
          refined_data.push({
            ...comment,
            user: postUser
          })
        }
        console.log("Checking User:", user.avatar)
        setRes(
          <CommentDisplay
            NFTAddress = {id}
            accountUser = {user}
            comments={refined_data}
            postId = {new PublicKey(id)}
            addCounter= {addCounter}
          />
        )
      }else{
        setRes(
          <CardDisplay>
            <ErrorNotification>{"You Haven't Been Registered As A User"}</ErrorNotification>
            <CardContainer>
                <Image width="300" height="300" src ="https://ivory-vivacious-rooster-272.mypinata.cloud/ipfs/QmYDF3xNce1wsBAxoQ4ayRYhyXzWjSYRDVZp4RphufG9PH" alt="Account Not Found"/>
            </CardContainer>
            <CardContainer>
                <ConnectButton onClick={createAccount}>
                    <ButtonFont>
                        Create New Account
                    </ButtonFont>
                </ConnectButton>
            </CardContainer>
        </CardDisplay>
        );
      }
    }else{
      setRes(
        <CardDisplay>
            <ErrorNotification>Wallet Not Detected</ErrorNotification>
            <CardContainer>
                <Image width="300" height="300" src ="https://ivory-vivacious-rooster-272.mypinata.cloud/ipfs/QmQAGGAbeS6jEyeEZiZQutmrKA2zTv7Hwwddza7bViEVRt" alt="Account Not Found"/>
            </CardContainer>
            <CardContainer>
                <ConnectButton>
                    <WalletMultiButtonDynamic/>
                </ConnectButton>
            </CardContainer>
        </CardDisplay>);
    }
  };
  useEffect(()=>{
    getComments();
  },[connection, wallet, counter])

  return(<>{res}</>)
}


export const CommentDisplay = ({NFTAddress, accountUser, comments, postId, addCounter}) => {
  const { AiFillHeart } = require('react-icons/ai');
  const { IoShareSocialSharp, IoEllipsisHorizontal } = require('react-icons/io5');

  const commentRef = useRef(null);
  const [comment, setComment] = useState<string>("");
  
  // Usestates only for placeholder and demonstration, remove when using real data and database
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set()); // use set for quick add and delete
  const [likes, setLikes] = useState<{ [key: string]: number }>(
    {}
    // placeholderComments.reduce((acc, comment) => {}
    //   acc[comment._id] = comment.likes;
    //   return acc;
    // }, {})
  );

  useEffect(() => {
    const updateLikes = async () => {
      const newLikes = { ...likes };
      for (const comment of comments) {
        const randomLikes = await generateRandomNumber(comment.account.content, 50);
        newLikes[comment.publicKey.toString()] = randomLikes;
      }
      setLikes(newLikes);
    }

    updateLikes();
  }, [])

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

  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const handleCommentSubmitClick = async () => {
    // TODO: Implement comment submission logic
    try{
      if(wallet){
        const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions())
        const program =  new anchor.Program<any>(BlogIDL, CONTRACT_ADDRESS, provider)
        const current_user:any = await getUser(wallet, program);
        const [userPda] = findProgramAddressSync([utf8.encode('user'), wallet.publicKey.toBuffer()], program.programId)
        const [postPda] = findProgramAddressSync([utf8.encode('post'), wallet.publicKey.toBuffer(), Uint8Array.from([current_user.lastPostId])], program.programId)

        const signature = await program.methods
        .createPost(NFTAddress.toString(), commentRef.current.value.toString())
        .accounts({
            userAccount: userPda,
            postAccount: postPda,
            authority: wallet.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc()
        addCounter();
        notify({ type: 'success', message: 'Post successfully created!', txid: signature });
      }
    }catch(e){
      console.log(e);
      notify({ type: 'error', message: `Transaction failed!`, description: e?.message});
    }
    clearTextArea();
  }

  return (
    <div className="flex flex-col justify-center rounded-md border-[#3c3c3c] border-2 max-w-[800px] bg-[#1e1e1e] shadow-lg">
      {/* Create Comment */}
      <div className="flex items-start border-b border-[#3c3c3c] border-1 gap-5 py-5">
        {/* Profile Picture */}
        <Image
          src={accountUser.avatar}
          alt="Profile Picture"
          width={50}
          height={50}
          className="rounded-full ml-5 object-contain bg-white"
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

      {comments.map((item, key)=>{
        return(
          <div key={key} className="flex justify-between py-5 border-b border-[#3c3c3c] border-1">
            <div className="flex items-start gap-5 max-w-full">
              {/* Profile Picture */}
              <Image
                src={item.user.avatar}
                alt="Profile Picture"
                width={50}
                height={50}
                className="rounded-full ml-5 object-contain bg-white"
              />
      
              {/* Text, Like, & Share button */}
              <div className="flex flex-col w-full mr-5 max-w-full px-3.5">
                {/* Username, usertag, and time since post */}
                <div className="flex items-center gap-2">
                  <p className="text-[#cecece]text-left font-bold">{item.user.name}</p>
                  <p className="text-[#b9b9b9] max-w-md truncate">{item.account.authority.toString()}</p>
                  <div className="bg-[#b9b9b9] h-1 w-1 rounded-full"></div>
                  <p className="text-[#b9b9b9]">10h</p>
                </div>
                {/* Comment Text */}
                <div className="flex justify-start">
                  <p className="text-[#cecece] text-left">{item.account.content}</p>
                </div>
      
                {/* Like & Share Button */}
                <div className="flex mt-4 items-center gap-5">
                  <div className="flex gap-2 cursor-pointer items-center" onClick={() => toggleLike(item.publicKey.toString())}>
                    {likedComments.has(item.publicKey.toString()) ? (
                      <AiFillHeart className="text-[#e6007e] text-lg" />
                    ) : (
                      <AiFillHeart className="text-[#cecece] text-lg" />
                    )}
                    <p className="text-sm font-bold mb-[1px]">{likes[item.publicKey.toString()]}</p>
                  </div>
                  <div className="flex gap-2 cursor-pointer items-center">
                    <IoShareSocialSharp className="text-[#cecece] text-lg" />
                    <p className="text-sm font-bold mb-[1px]">{parseInt(likes[item.publicKey.toString()] / 2.5)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ellipsis */}
            <div>
              <IoEllipsisHorizontal className="text-[#cecece] text-lg mr-5 cursor-pointer" />
            </div>
          </div>
        );
      })}
    </div>
  )
}

const ErrorNotification = styled.div`
    margin-top:20px;
    font-size: 30px;
    font-weight: bold;
`
const CardDisplay = styled.div`
    width: 800px;
    background: #1e1e1e;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    margin: auto;
    overflow: hidden;
    margin-bottom: 20px;
`
const CardContainer = styled.div`
    width: 100%;
    display:flex;
    justify-content:center;
    align-items:center;
`
const ConnectButton = styled.div`
    background: #000000;
    border-radius: 10px;
    text-align: center;  
    font-size: 20px; 
    cursor: pointer;
    margin-bottom: 30px;
`
const ButtonFont = styled.div`
    font-size: 15px; 
    font-weight: bold;
    padding: 15px;
`