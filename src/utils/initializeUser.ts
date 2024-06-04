import md5 from 'crypto-js/md5';

const WORD1 = ["Bright", "Silver", "Mystic", "Bold", "Rapid", "Golden", "Shadow", "Fierce", "Silent", "Crimson", "Brave", "Hidden", "Mighty", "Ancient", "Swift", "Eternal", "Blazing", "Tranquil", "Luminous", "Whispering", "Thunder", "Celestial", "Enchanted", "Frosty", "Glorious", "Mysterious", "Noble", "Radiant", "Serene", "Valiant", "Verdant", "Wild", "Zephyr", "Starlit", "Majestic", "Bold", "Vivid", "Gleaming", "Daring", "Resolute", "Gallant", "Splendid", "Mystic", "Enigmatic", "Pristine", "Vigorous", "Spirited", "Fearless", "Dazzling", "Bewitched"]
const WORD2 = ["Falcon", "Horizon", "Meadow", "Phoenix", "Quest", "Harbor", "Echo", "Grove", "Summit", "Wave", "Whisper", "Star", "Shadow", "Guardian", "Dragon", "Path", "Journey", "Thunder", "Forest", "Dawn", "Blaze", "Flame", "Beacon", "Tide", "Realm", "Fortress", "Cascade", "Sky", "Haven", "Gale", "Storm", "Moon", "Echo", "Radiance", "Wing", "Voyage", "Trail", "Frost", "Ridge", "Light", "Flame", "Echo", "Spirit", "Clarity", "Courage", "Star", "Quest", "Ocean", "Flame", "Ember"]


//Pick Random Index from an array
function pickRandomIndex(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomName() {
    const word1 = pickRandomIndex(WORD1);
    const word2 = pickRandomIndex(WORD2);
    return word1 + " " + word2;
}

function generateRandomImage(key){
    console.log("Key is:", md5(key))
    return `https://gravatar.com/avatar/${md5(key)}?s=400&d=robohash&r=x`;
}

export function generateRandomUser(){
    const userName = generateRandomName();
    const userAvatar = generateRandomImage(userName);
    return{userName, userAvatar}
}
