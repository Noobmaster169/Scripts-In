import * as anchor from '@project-serum/anchor'
import { FC, useCallback, useMemo, useState, useEffect } from 'react';
import { notify } from "../utils/notifications";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BlogIDL } from "../anchor/blog_idl";
import { Metaplex, walletAdapterIdentity, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { getPostById, getAccount, getUser} from "../anchor/blog_setup";
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {PostDisplay} from './Profile';

const quicknodeEndpoint = process.env.NEXT_PUBLIC_RPC || clusterApiUrl('devnet');
const CONTRACT_ADDRESS = new PublicKey(BlogIDL.metadata.address);
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
  );

export const Gallery = ()=> {
    const { connection } = useConnection();
    const wallet = useWallet();
    const route = useRouter();
    const { getUserSOLBalance } = useUserSOLBalanceStore();
    
    const [gallery, setGallery] = useState(null);
    const NFTAddress= [
        "Ariq1YVsi6zqQb7dU3xjFUFyoaHwUvhtfKVrEa5ZEt5A",
        "953EiExPMGpdJn3kSNxfyjz3jM2VMXSr1EBkuJCCVqCU",
        "ELkup3zAMfqwoECRcrKwtGD92Na5tw29p3uqC7aUtrGf",
        "3cVo3EJRGf6ZMyKYbJqyKho6BN7z6YqzpA2RncvM4ZE7",
        "8zzLQdqnKeBdb65dQzESNbTsBGdf7cudgt4psCUMaVyu"
    ];

    const METAPLEX = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet))
        .use(bundlrStorage({
            address: 'https://devnet.bundlr.network',
            providerUrl: quicknodeEndpoint,
            timeout: 60000,
        }));

    useEffect(() =>{
        async function searchNFT(){
            const NFTDisplays: JSX.Element[] = [];
            for (const address of NFTAddress) {
                
                const mintAddress = new PublicKey(address);
                const nft: any = await METAPLEX.nfts().findByMint({ mintAddress }, { commitment: "finalized" });
                const imageUrl = nft.json.image;
                
                NFTDisplays.push(
                    <GalleryCard onClick={() => {route.push(`/nft/${address}`)}}>
                        <Image width="300" height="300" src={ nft.json.image } alt="NFT Display" />
                        <Cardinformation>
                            <CardTitle>{nft.json.name}</CardTitle>
                            <CardPrice>NOT LISTED</CardPrice>
                        </Cardinformation>
                    </GalleryCard>
                )
                
                //NFTDisplays.push(<img width="300" height="300" src={imageUrl} />);
              }
            setGallery(NFTDisplays)
        }
        searchNFT();
    }, []);

    return(
        <>
        <TitleContainer>
            <GalleryTitle>
                Featured NFTs:
            </GalleryTitle>
        </TitleContainer>
        <div className="flex flex-row justify-center">
            {gallery ? gallery : "No NFT Detected"}
        </div>
        <FeaturedPosts/>
        </>
    )
}

const FeaturedPosts = ()=>{
    const wallet = useAnchorWallet();
    const { connection } = useConnection();

    const[loading, setLoading] = useState(false);
    const[posts, setPosts] = useState<any>();
    const[res, setRes] = useState<any>();    

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
    
    const getPost = async () =>{
        console.log("Initializing Get Post")
        if(wallet){        
            setLoading(true);
            try{
                console.log("Searching for Posts");
                const user:any = await getUser(wallet, program);
                const {users_data, lastPostId} = await getAccount(wallet, program, user);
                console.log("Users Data Found")
                // const filtered_data = users_data.filter((item) =>{
                //     return item.account.authority.toString()=== wallet.publicKey.toString();
                // });
                // const sorted_data = filtered_data.sort((a,b) =>{
                //     return 
                // })
                const refined_data = []
                for(const posts of users_data){
                    const postUser = await getUser(wallet, program, posts.account.authority);
                    refined_data.push({
                      ...posts,
                      user: postUser
                    })
                }
                setPosts(refined_data);
            }catch(e){
                console.log(e);
            }
            setLoading(false);
        }else{
            setPosts(null);
        }
    }
    
    useEffect(()=>{
      getPost(); 
    }, [connection, wallet]);
    
    return(
        <>
        <TitleContainer>
            <GalleryTitle>
                Latest Posts:
            </GalleryTitle>
        </TitleContainer>
        <div>
            {posts ? posts.map((item, key)=>{
                return(
                    <PostDisplay
                        address = {item.account.title}
                        wallet = {wallet}
                        item = {item}
                        connection = {connection}
                        program = {program}
                    />
                );
            })
            :
            <div className="flex flex-row justify-center">
                {loading? "Loading..." : "No Post Detected"}
            </div>
            }
        </div>
        </>
    )
}

const GallerySection = styled.div`
    padding: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
`
const GalleryCard = styled.div`
    width: 220px;
    background: #333;
    border-radius: 10px;
    overflow: hidden;
    margin: 15px;
` 
const Cardinformation = styled.div`
    padding: 5px 15px;
    margin-bottom: 5px;
`
const CardTitle = styled.div`
    font-size: 20px;
`
const CardPrice = styled.div`
    color: #50fa7b;
`
const ProfileTitle = styled.div`
    font-size: 30px;
    font-weight: bold;
    border-bottom: 2px solid white;
    width: 200px;
    margin-bottom: 15px;
`
const TitleContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
`
const GalleryTitle = styled.div`
    color: white;
    font-size: 30px;
    font-weight: bold;
    font-family: Arial, sans-serif;
    border-bottom: 3px solid white;
    margin-bottom: 20px;
`
const ProfileInfo = styled.div`
    text-align:left;
    margin: 0px 30px;
    width: 500px;
`
const ProfileName = styled.div`
    font-size: 35px;
    font-weight: bold;
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
const InfoData = styled.div`
    margin-right: 20px;
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