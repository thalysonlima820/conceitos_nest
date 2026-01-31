import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { RegexProtocol } from "./regex.protocol";
import { onlyLowercaseLettersRegex } from "./only-lowercase-letters.regex";
import { removeSpacesRegex } from "./remove-spaces.regex";

export type Classname = 'onlyLowercaseLettersRegex' | 'removeSpacesRegex'

@Injectable()
export class RegexFactory {
    create(classname: Classname): RegexProtocol {
        switch(classname) {
            case 'onlyLowercaseLettersRegex':
                return new onlyLowercaseLettersRegex()
            case 'removeSpacesRegex' :
                return new removeSpacesRegex()
            default:
                throw new InternalServerErrorException(
                    `class nao existente em ${classname}`
                )
        }
    }
}