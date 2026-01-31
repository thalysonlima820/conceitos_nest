import { RegexProtocol } from "./regex.protocol";

export class onlyLowercaseLettersRegex extends RegexProtocol {
     execute(str: string): string {
        return str.replace(/[ˆa-z]/g, '')
     }
}