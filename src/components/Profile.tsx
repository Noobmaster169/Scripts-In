import * as anchor from '@project-serum/anchor'
import { AnchorProvider, Program } from "@project-serum/anchor";
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BlogIDL } from "../anchor/blog_idl";
import { useEffect, useState, useMemo } from "react";
import { getPostById, getAccount, getUser} from "../anchor/blog_setup";
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import Image from 'next/image';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const CONTRACT_ADDRESS = new PublicKey(BlogIDL.metadata.address);
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
  );

export const ProfileView = ()=>{
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    //const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>();
    const [response, setResponse] = useState<any>("Loading");

    const route = useRouter();
    const createAccount = () =>{
        route.push(`/new`)
    }

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
                    <CardDisplay>
                        <Image width="300" height="300" src={ user.avatar } alt="Profile Picture" />
                        <div>
                            <p>Name: {user.name}</p>
                            <p>Address: {user.authority.toString()}</p>
                            <p>Total Posts: {user.postCount}</p>
                            <p>SCRIPTS Points: {user.postCount * 10}</p>
                        </div>
                    </CardDisplay>
                    <PostSection/>
                </>)
            }else{
                setResponse(
                <CardDisplay>
                    <ErrorNotification>You Haven't Been Registered As A User</ErrorNotification>
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
            setResponse(
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
    }

    useEffect(() =>{
        setResponse("Loading");
        getProfile();
    }, [connection, wallet])

    return(<>
        {response}
    </>)
}


const PostSection = () =>{
    return(
        <>
        This is Post Section, which will contain the User's Posts
        </>
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
    padding-bottom: 30px;
`;
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
`
const ButtonFont = styled.div`
    font-size: 15px; 
    font-weight: bold;
    padding: 15px;
`