import AES from 'crypto-js/aes';
import SHA256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';

export async function encryptFile(fileToEncrypt, setFile) {
    var reader = new FileReader();
    reader.readAsDataURL(fileToEncrypt);
    reader.onload = function () {
        var encryptedData = AES.encrypt(reader.result, 'your-sceret-key').toString(); 
        
        setFile(encryptedData);
        return encryptedData;
    };
}

export async function uploadEncryptedFile(fileToUpload){
    console.log("Uploading Encrypted File")
    const encryptedBlob = new Blob([fileToUpload], { type: "application/octet-stream" });    
    const data = new FormData();
    data.set("file", encryptedBlob);
    const res = await fetch("/api/upload", {
        method: "POST",
        body: data
    });
    const resData = await res.json();
    return resData.IpfsHash;
    
    /*setCid(resData.IpfsHash);
    setUploading(false);
    return `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${resData.IpfsHash}`*/
}

export async function uploadPublicFile(fileToUpload){
    console.log("Uploading Public File")
    const data = new FormData();
    data.set("file", fileToUpload);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: data
    });
    const resData = await res.json();
    return resData.IpfsHash;
}

export async function uploadJSON(fileToUpload){
    console.log("Uploading JSON File")
    const blob = new Blob([JSON.stringify(fileToUpload)], { type: "application/json" });
    const data = new FormData();
    data.append("file", blob);
    const res = await fetch("/api/upload", {
    method: "POST",
    body: data,
    });
    const resData = await res.json();
    return resData.IpfsHash;
}

export async function decryptData(fileUrl){
    
}

export async function generateRandomNumber(text: string, range: number) {
  // TO FIX: AES encryption generates different encryption for same text for some reason
  // const encryptedText = AES.encrypt(text, "your-secret-key").toString();
  // console.log("Encrypted text:", encryptedText, "\n", text, "\n")
  // const hash = SHA256(encryptedText).toString(encHex);

  let sum = 0;
  for (let i = 0; i < text.length; ++i) {
    sum += text.charCodeAt(i);
  }

  const randomNumber = sum % range + 1;

  return randomNumber;
}
