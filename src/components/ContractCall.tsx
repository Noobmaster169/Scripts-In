import * as anchor from '@project-serum/anchor'
import { AnchorProvider, Program } from "@project-serum/anchor";
//import { Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BlogIDL } from "../anchor/blog_idl";
import { useEffect, useState, useMemo } from "react";
import { getPostById, getAccount, getUser} from "../anchor/blog_setup";
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from "@solana/web3.js";

import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { notify } from "../utils/notifications";

const CONTRACT_ADDRESS = new PublicKey(BlogIDL.metadata.address);
const postId = "8jADm65XEo2GrURjEQH77AgoH2E845KwkW5HiQCJw8bk";

export const BlogPost = ()=>{    
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    //const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    const [loading, setLoading] = useState(false);
    const [postData, setPostData] = useState("");
    const [users, setUsers] = useState<any>();

    //const [lastPostId, setLastPostId] = useState()
    //const [provider, setProvider] = useState<any>();

    const program = useMemo(() => {
        if (wallet) {
            try{
                const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions())
                return new anchor.Program<any>(BlogIDL, CONTRACT_ADDRESS, provider)
            }catch(e){
                console.log(e);
                return null;
            }
        }
      }, [connection, wallet])

    async function search(){
        console.log("Tes");
        console.log("Searching for Post with id:", postId);
        console.log(wallet);
        setLoading(true);
        if(wallet){
            try{
                console.log("Calling Smart Contract");
                const program = new Program<any>(BlogIDL, CONTRACT_ADDRESS, {connection});
                const post :any = await getPostById(postId.toString(), program);
                setPostData(JSON.stringify(post));
                console.log("Post Retreival successful"); 
            }catch(e){
                console.log("Fail to retrieve post");
                console.log(e);
            }
        }else{
            console.log("Provider not detected");
        }
        setLoading(false);
    }

    async function getUsers(){
        console.log("Searching For Users");
        if(wallet){
            try{
                console.log("Calling Smart Contract");
                const program = new Program<any>(BlogIDL, CONTRACT_ADDRESS, {connection});        
                
                const user:any = await getUser(wallet, program);
                const {users_data, lastPostId} = await getAccount(wallet, program, user);

                const filtered_data = users_data.filter((item) =>{
                    return item.account.authority.toString()=== "FyXBRbzmxpVXdwVV1ZVbL1h91wSJNzjnT4uNk9dzdLrH";
                })
                console.log(filtered_data.length);
                setUsers(filtered_data);
                console.log("Accounts Retreival successful"); 
            }catch(e){
                console.log("Fail to retrieve users list");
                console.log(e);
            }
        }else{
            console.log("Provider not detected");
        }
    }

    async function makePost(){
        console.log("Posting Data");
        const title = "HELLO WORLD"
        const content = "Does this work? Thank you for the content."
        
        const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions())
        const program =  new anchor.Program<any>(BlogIDL, CONTRACT_ADDRESS, provider)
        
        //const program = new Program<any>(BlogIDL, CONTRACT_ADDRESS, {connection}); 
        const user:any = await getUser(wallet, program);

        console.log("Calling Contract");
        const [userPda] = findProgramAddressSync([utf8.encode('user'), wallet.publicKey.toBuffer()], program.programId)
        const [postPda] = findProgramAddressSync([utf8.encode('post'), wallet.publicKey.toBuffer(), Uint8Array.from([user.lastPostId])], program.programId)

        if(!wallet){
            notify({ type: 'error', message: `Wallet Not Detected!`});
        }
        if(user.lastPostId){
            try{
                console.log("Calling Contract");
                const [userPda] = findProgramAddressSync([utf8.encode('user'), wallet.publicKey.toBuffer()], program.programId)
                const [postPda] = findProgramAddressSync([utf8.encode('post'), wallet.publicKey.toBuffer(), Uint8Array.from([user.lastPostId])], program.programId)

                const signature = await program.methods
                .createPost(title, content)
                .accounts({
                    userAccount: userPda,
                    postAccount: postPda,
                    authority: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc()

                notify({ type: 'success', message: 'Post successfully created!', txid: signature });
            }catch(e){
                console.log(e);
                notify({ type: 'error', message: `Transaction failed!`, description: e?.message});
            }

            console.log("Successful?");
        }else{
            notify({ type: 'error', message: `Social Account Not Detected!`});
            console.log("Account Not Detected");
        }
    }

    return(
    <>
        <div><button onClick={search}>{loading? "Loading" : "Search Post"}</button></div>
        <div><button onClick={getUsers}>{loading? "Loading" : "Search Users"}</button></div>
        <div><button onClick={makePost}>{loading? "Loading" : "Create Post"}</button></div>
        
        <h1> SPACE </h1>
        {postData? postData: "Post Data Not Detected"}
        {users? users.map((item, key) =>{
            return(<div>
                <p>Post ID:{item.publicKey.toString()}</p>
                <p>User:{item.account.authority.toString()}</p>
                <p>Nonce: {item.account.id}</p>
                <p>Title:{item.account.title}</p>
                <p>Content: {item.account.content}</p>
                <p>.</p>
            </div>);
        }):"No Post"}
    </>)
}