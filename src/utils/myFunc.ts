import axios from "axios";
import { myConfig } from "../config";
// **************************************************************************************************** 
export const getImageAsBase64 = async (url) => {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer', // Set the response type to arraybuffer to handle binary data
        });
        return Buffer.from(response.data, 'binary').toString('base64');
    } catch (error) { return ""; }
}
// **************************************************************************************************** 
export const limitFloat = (number) => {
    return Math.floor(number * 100) / 100;
    // return parseFloat(number.toFixed(2));
}
// **************************************************************************************************** 
let count = 0;
export const myLog = (str: any) => {
    if (myConfig.myLog == false) return;
    console.log(`------------------------------ ${count++} ------------------------------`)
    console.log(str)
}
// **************************************************************************************************** 
export const toPage = (itemsCountAll: number, pageNumber?: number, itemsTake?: number) => {
    itemsTake = itemsTake ?? 100;
    itemsTake = itemsTake < 1 ? 1 : itemsTake;
    // 
    pageNumber = pageNumber ?? 1;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;
    // 
    let allPagesCount = Math.ceil(itemsCountAll / itemsTake);
    pageNumber = pageNumber > allPagesCount ? allPagesCount : pageNumber;
    // 
    allPagesCount = allPagesCount < 1 ? 1 : allPagesCount;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;
    // 
    const itemsSkip = (pageNumber - 1) * itemsTake;
    return { allPagesCount, itemsTake, pageNumber, itemsSkip };
}
// **************************************************************************************************** 

export function generateRandomString(min, max) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    const randomLength = Math.floor(Math.random() * (max - min + 1)) + min;
    let randomString = '';
    for (let i = 0; i < randomLength; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
}

export const generateID = (input: string) => {
    return input + "_" + (new Date().toISOString()) + "_" + generateRandomString(20, 20);
}

export function generateRandomInt(min, max) {
    const randomLength = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomLength;
}

export function generateRandomFloat(min, max) {
    const randomLength = Math.random() * (max - min + 1) + min;
    return randomLength;
}
