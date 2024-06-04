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
// function getProgram(provider) {
//     return new Program(idl, PROGRAM_KEY, provider);
// }

// const wallet = useAnchorWallet();
// const { connection } = useConnection();
// const provider = new AnchorProvider(connection, wallet, {});
// const program = getProgram(provider);



// const programId = new PublicKey(BlogIDL.metadata.address);
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// export const program = new Program<any>(BlogIDL, programId, {
//     connection,
// });

//Don't Forget to install Anchor

export async function getPostById(postId:any, program:any) {
  console.log("Calling getPost function");
  try {
    const post = await program.account.postAccount.fetch(new PublicKey(postId));
    
    //Try to console data
    console.log("System whatever:", SystemProgram.programId.toString());
    console.log("Post Data:", post);
    
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
  console.log("Searching for accounts");
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

export async function getUser(wallet:any, program:any){
  try{
    const [userPda] = await findProgramAddressSync([utf8.encode('user'), wallet.publicKey.toBuffer()], program.programId);
    const user = await program.account.userAccount.fetch(userPda);
    console.log("User Detected");
    console.log(user.authority.toString());
    
    return user;
  }catch(e){
    console.log("Error Fetching User Data");
    console.log(e);
  }
}