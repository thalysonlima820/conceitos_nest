import { RegexProtocol } from "./regex.protocol";

export class removeSpacesRegex extends RegexProtocol {
     execute(str: string): string {
        return str.replace(/\s+/g, '')
     }
}