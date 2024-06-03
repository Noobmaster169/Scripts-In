import * as anchor from '@project-serum/anchor'
import { AnchorProvider, Program } from "@project-serum/anchor";
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BlogIDL } from "../anchor/blog_idl";
import { useEffect, useState, useMemo } from "react";
import { getPostById, getAccount, getUser} from "../anchor/blog_setup";
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from "@solana/web3.js";

import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { notify } from "../utils/notifications";
import { generateRandomUser } from '../utils/initializeUser';
import Image from 'next/image';
import styled from 'styled-components';

const CONTRACT_ADDRESS = new PublicKey(BlogIDL.metadata.address);

export const InitializeUser = () =>{
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    
    const {userName, userAvatar} = generateRandomUser();
    const [pending, setPending] = useState(false);

    const connect = async () =>{
        setPending(true);
        if(!wallet){
            notify({ type: 'error', message: `Wallet Not Detected!`});
        }else{
            try{
                const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions())
                const program =  new anchor.Program<any>(BlogIDL, CONTRACT_ADDRESS, provider)
                const [userPda] = findProgramAddressSync([utf8.encode('user'), wallet.publicKey.toBuffer()], program.programId)
                
                await program.methods
                .initUser(userName, userAvatar)
                .accounts({
                    userAccount: userPda,
                    authority: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc()
                
                
                notify({ type: 'success', message: 'Account successfully created!'});
            }catch(e){
                console.log(e);
                notify({ type: 'error', message: `Account Creation failed!`, description: e?.message});
            }
        }
        setPending(false);
    }

    return(
        <CardDisplay>
            <CardTitle>Creating New User</CardTitle>
            <CardContainer>
                <CardImage>
                    <Image width="250" height="250" src={ userAvatar } alt="NFT Display" />    
                </CardImage>
            </CardContainer>
            <CardName>{userName}</CardName>
            <CardContainer>
                {pending? 
                    <InitButton>
                        Pending...
                    </InitButton> 
                    : 
                    <InitButton onClick={connect}>
                        Create User
                    </InitButton>
                }
            </CardContainer>
        </CardDisplay>
    )
}

const CardDisplay = styled.div`
    width: 800px;
    background: #1e1e1e;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    margin: auto;
    overflow: hidden;
    padding-bottom: 30px;
`;
const CardTitle = styled.div`
    width: 100%;
    background-color: #333;
    color: #fff;
    text-align: center;
    font-size:35px;
    font-weight: bold;
    padding: 20px;
    margin-bottom: 30px;
`
const CardContainer = styled.div`
    width: 100%;
    display:flex;
    justify-content:center;
    align-items:center;
`
const CardImage = styled.div`
    width: 250px;
    height:250px;
    border-radius: 10px;
    background: #ffffff
`
const CardName = styled.div`
    margin: 15px;
    font-size: 30px;
`
const InitButton = styled.div`
    background-color: #e6007e;
    color: #fff;
    padding: 8px;
    font-weight: bold;
    font-size: 20px;
    border: none;
    cursor: pointer;
    text-align: center;
    border-radius: 5px;
    width: 250px;
    height: 45px;
`

