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
import Image from 'next/image';

const CONTRACT_ADDRESS = new PublicKey(BlogIDL.metadata.address);

export const ProfileView = ()=>{
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    //const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>();
    const [response, setResponse] = useState<any>("Loading");

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

    const getProfile = async () =>{
        if (program){
            const user:any = await getUser(wallet, program);
            if(user){
                console.log(user);
                setUser(user);
                setResponse(
                <>
                    <p>Name: {user.name}</p>
                    <Image width="300" height="300" src={ user.avatar } alt="NFT Display" />
                    <p>Total Posts: {user.postCount}</p>
                    <p>Address: {user.authority.toString()}</p>
                </>)
            }else{
                setResponse("You Haven't Been Registered As A User");
            }
        }else{
            setResponse("Wallet Not Detected");
        }
    }

    useEffect(() =>{
        setResponse("Loading");
        getProfile();
    }, [connection, wallet])

    return(<>
        {response}
    </>)
}