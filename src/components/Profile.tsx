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
import { secondsToMinutes } from 'date-fns';
import { Metaplex, walletAdapterIdentity, bundlrStorage} from "@metaplex-foundation/js";
import { generateRandomNumber } from '../utils/ipfs';

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
                        <TopContainer>
                            <CardImage>
                                <Image width="250" height="250" src={ user.avatar } alt="Profile Picture" /> 
                            </CardImage>
                            <ProfileInfo>
                                <ProfileName>{user.name}</ProfileName>
                                <ProfileAddress>
                                <a href={`https://explorer.solana.com/address/${user.authority.toString()}/metadata?cluster=devnet`} target="_blank">
                                {user.authority.toString()}
                                </a>
                                </ProfileAddress>
                                <ProfileDesc>
                                    {`Hello, I'm ${user.name}`}
                                    {/*Hello, my name is Anne. I'm a loving grandma who enjoys cooking and baking. 
                                    I'd like to share this exciting experiences by teaching you how to cook through cooking recipes & tutorial videos.
                                    Enjoy ^_^*/}
                                </ProfileDesc>
                                <InfoContainer>
                                    <InfoData>
                                        <InfoTitle>SCRIPTS Points</InfoTitle>
                                    </InfoData>
                                    <InfoData>
                                        <div>:</div>
                                    </InfoData>
                                    <InfoData>
                                        <div>{user.postCount * 10} points</div>
                                    </InfoData>
                                </InfoContainer>
                            </ProfileInfo>
                        </TopContainer>
                    </CardDisplay>
                    <PostSection
                        wallet = {wallet}
                        program = {program}
                        connection = {connection}
                    />
                </>)
            }else{
                setResponse(
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


export const PostSection = ({wallet, program, connection}) =>{
    const[loading, setLoading] = useState(false);
    const[posts, setPosts] = useState<any>();    

    const getPost = async () =>{
        setLoading(true);
        try{
            const user:any = await getUser(wallet, program);
            const {users_data, lastPostId} = await getAccount(wallet, program, user);

            const filtered_data = users_data.filter((item) =>{
                return item.account.authority.toString()=== wallet.publicKey.toString();
            });
            const sorted_data = filtered_data.sort((a,b) =>{
                return 
            })
            setPosts(filtered_data);
        }catch(e){
            console.log(e);
        }
        setLoading(false);
    }
    
    useEffect(()=>{
        getPost();
    }, [program]);
    
    return(
        <>
        <div>
            <CardContainer>
                <ProfileTitle>
                    Latest Posts
                </ProfileTitle>
            </CardContainer>
            {posts ? posts.map((item, key)=>{
                let blank = key;
                return(
                    <div>
                        <PostDisplay
                            address = {item.account.title}
                            wallet = {wallet}
                            item = {item}
                            connection = {connection}
                            program = {program}
                        />
                    </div>
                );
            }): "No Post Detected"}
        </div>
        </>
    )
}

export const PostDisplay = ({address, wallet, item, connection, program}) =>{
    const quicknodeEndpoint = process.env.NEXT_PUBLIC_RPC || clusterApiUrl('devnet');
    const { AiFillHeart } = require('react-icons/ai');
    const { IoShareSocialSharp, IoEllipsisHorizontal } = require('react-icons/io5');
    
    const [NFTData, setNFTData] = useState<any>();
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);

    const METAPLEX = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet))
        .use(bundlrStorage({
            address: 'https://devnet.bundlr.network',
            providerUrl: quicknodeEndpoint,
            timeout: 60000,
        }));
    const toggleLike = ()=>{
        if(liked){
            setLikes(likes -1);
            setLiked(false);
        }else{
            setLikes(likes +1);
            setLiked(true);
        }
    }

    const route = useRouter();
    
    async function searchNFT(address){
        try{
            const mintAddress = new PublicKey(address);
            const nft: any = await METAPLEX.nfts().findByMint({ mintAddress }, { commitment: "finalized" });
            //console.log("NFT:", nft)
            const generatedLikes = await generateRandomNumber(item.account.content, 50);
            
            const openNFT = () =>{
                route.push(`/nft/${mintAddress.toString()}`)
            }
            
            const user:any = await getUser(wallet, program);
            console.log("Setting NFT Data")
            setNFTData(
                <CardDisplay>
                <PostContainer>
                    <PostImage onClick={openNFT}>
                        <Image width="250" height="250" src={nft.json.image} alt="Account Not Found"/>
                    </PostImage>
                    <PostProfile>
                        {/*<NFTTitle>
                            <UserName>{nft.json.name}</UserName>
                            <p>Created By: {nft.creators[0].address.toString()}</p>
                        </NFTTitle>*/}
                        <UserContainer>
                            <PostProfileImage>
                                <Image width="50" height="50" src={item.user? item.user.avatar : user.avatar} alt="Account Not Found"/>
                            </PostProfileImage>
                            <div>
                                <UserName>{item.user? item.user.name :user.name}</UserName>
                                <UserAddress>{item.user? item.user.authority.toString() :item.account.authority.toString()}</UserAddress>  
                            </div>
                        </UserContainer>
                        
                        <PostContent>
                            {item.account.content}
                        </PostContent>
                        <div className="flex items-start gap-5 max-w-full">
                            <div>   
                                <div className="flex mt-4 items-center gap-5">
                                <div className="flex gap-2 cursor-pointer items-center" onClick={() => toggleLike()}>
                                    {liked ? (
                                    <AiFillHeart className="text-[#e6007e] text-lg" />
                                    ) : (
                                    <AiFillHeart className="text-[#cecece] text-lg" />
                                    )}
                                    <p className="text-sm font-bold mb-[1px]">{generatedLikes}</p>
                                </div>
                                <div className="flex gap-2 cursor-pointer items-center">
                                    <IoShareSocialSharp className="text-[#cecece] text-lg" />
                                    <p className="text-sm font-bold mb-[1px]">{parseInt(generatedLikes / 2.5)}</p>
                                </div>
                                <div>
                                <IoEllipsisHorizontal className="text-[#cecece] text-lg mr-5 cursor-pointer" />
                                </div>
                                </div>
                            </div>
                        </div>
                    </PostProfile>
                </PostContainer>
                </CardDisplay>
            )
        }catch(error){
            setNFTData(<></>)
        }
    }

    useEffect(()=>{
        searchNFT(address);
    }, [address, wallet, connection])

    return (
        <>{NFTData}</>
    )
}


const ProfileTitle = styled.div`
    font-size: 30px;
    font-weight: bold;
    border-bottom: 2px solid white;
    width: 200px;
    margin-bottom: 15px;
`
const ProfileInfo = styled.div`
    text-align:left;
    margin-left: 25px;
    width: 460px;
    height: 250px;
    padding: 5px 20px;
    background: #333333;
    overflow: hidden;
`
const ProfileAddress = styled.div`
    color: #cccccc;
    text-decoration: underline;
    margin-top: -5px;
`
const PostProfile = styled.div`
    text-align:left;
    margin-left: 25px;
    width: 500px;
    height: 200px;
    padding: 5px 20px;
    background: #333333;
`
const ProfileName = styled.div`
    font-size: 35px;
    font-weight: bold;
`
const ProfileDesc = styled.div`
    margin-top: 15px;
    font-size: 15px;
`
const UserName = styled.div`
    font-size: 22px;
    font-weight: bold;
    margin-bottom: -5px;
`
const UserAddress = styled.div`
    font-size: 10px;
`
const PostContent = styled.div`
    font-size: 17px;
`
const PostImage = styled.div`
    width: 200px;
    height:200px;
    border-radius: 10px;
    background: #ffffff;
    overflow: hidden;
`
const PostProfileImage = styled.div`
    width: 50px;
    height:50px;
    border-radius: 50px;
    background: #ffffff;
    overflow: hidden;
    margin-right: 10px;
`
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
    margin-bottom: 15px;
`;
const CardImage = styled.div`
    width: 250px;
    height:250px;
    border-radius: 10px;
    background: #ffffff;
    overflow: hidden;
`
const TopContainer = styled.div`
    width: 100%;
    display:flex;
    margin: 30px;
`
const InfoContainer = styled.div`
    width: 100%;
    display:flex;
    margin: 20px;
    margin-left: 0px;
`
const PostContainer = styled.div`
    padding: 30px;
    width: 100%;
    display:flex;
    justify-content:center;
    align-items:flex-start;
`
const UserContainer = styled.div`
    display:flex;
    margin: 10px 0px;
`
const NFTTitle = styled.div`
    margin-bottom: 10px;
    padding: 5px 10px;
    background: #111111;
    width: 100%;
    border-radius: 10px;
    font-size: 15px; 
    display: flex;
    justify-content: center;
`
const InfoData = styled.div`
    margin-right: 20px;
    font-weight: bold;
`
const InfoTitle = styled.div`
    font-weight: bold;
    margin: 1px;
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