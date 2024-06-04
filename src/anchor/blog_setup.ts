import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import {BlogIDL} from "./blog_idl";
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { Buffer } from 'buffer';

import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';

export async function getPostById(postId:any, program:any) {
  try {
    const post = await program.account.postAccount.fetch(new PublicKey(postId));
    
    //Try to console data
    // console.log("System whatever:", SystemProgram.programId.toString());
    // console.log("Post Data:", post);
    
    const userId = post.user.toString();
    if (userId === SystemProgram.programId.toString()) {
      return;
    }
    return {
      id: postId,
      title: post.title,
      content: post.content,
      userId,
    };
  } catch (e) {
    console.log(e);
  }
}

export async function getAccount(wallet:any, program:any, user:any){
  try{
    //Search for All the Posts
    if (user) {
      const users_data = await program.account.postAccount.all(wallet.publicKey.toString());
      return({users_data, lastPostId: user.lastPostId});
    }
  }catch(e){
    console.log(e);
  }
}

export async function getUser(wallet:any, program:any, searched:PublicKey=null){
  const searchedKey = searched? searched: wallet.publicKey
  try{
    const [userPda] = await findProgramAddressSync([utf8.encode('user'), searchedKey.toBuffer()], program.programId);
    const user = await program.account.userAccount.fetch(userPda);
    return user;
  }catch(e){
    console.log("Error Fetching User Data");
    console.log(e);
  }
}