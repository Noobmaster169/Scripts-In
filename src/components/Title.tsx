import styled from 'styled-components';
import { useRouter } from 'next/router';
import {Input} from 'antd';
import Image from 'next/image';

export const Title = () =>{

    const router= useRouter();

    const routeCreate = () => {router.push('/create')};

    return(
        <>
        <TitleSection>
            <TitleImage>
                <Image src="https://ivory-vivacious-rooster-272.mypinata.cloud/ipfs/QmczgmvVffgZgRjRQTvvWcXBWguLKKeHpKE4s7KJfr7J1p" height={200} width={200} alt="Document Image" />
            </TitleImage>
            <div>
                <TitleInformation>
                    <p>Empower Your Community with:</p>
                    <ColoredTitle className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                        Exclusive Content NFTs
                    </ColoredTitle>
                </TitleInformation>
                <TitleDescription>
                    <p>&quot;Igniting Incentivized Social Community&quot;</p>
                </TitleDescription>
                <Button onClick={routeCreate}>
                    Create NFTs
                </Button>  
            </div>
        </TitleSection>
        <SearchContainer>
            <Search
                placeholder="Search NFT By Address"
                enterButton="Search"
                size="large"
                style={{width:"50%", backgroundColor:"blue", borderRadius:"10px", padding:"3px 3px 1px 3px", marginTop:"10px"}}
                onSearch={(address) => {console.log("Searching to", address); router.push(`/nft/${address}`)}}
            /> 
        </SearchContainer>
        </>
    )
}

const { Search } = Input;
const TitleSection = styled.div`
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: #999999
    margin: 30px 0px;
    border-radius: 10px;
    padding: 20px;
    text-align: left;
`
const TitleInformation = styled.div`
    font-size: 40px;
`
const TitleImage = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-left: 15px;
    margin-right: 25px;
`
const TitleDescription = styled.div`
    font-size: 18px;
`
const ColoredTitle = styled.div`
    margin-top: -20px;
`
const Button = styled.div`
    margin: 15px 0px;
    background-color: #4CAF50;
    font-size: 25px;
    font-weight: bold;
    color: white;
    width: 170px;
    padding: 5px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
`
const SearchContainer = styled.div`
    display:flex;
    justify-content: center;
    align-items: center;
`