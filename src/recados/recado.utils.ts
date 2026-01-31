import { Injectable } from "@nestjs/common";

@Injectable()
export class RecadoUltils {
    inventerString(str: string) {
        return str.split('').reverse().join('')
    }
}

@Injectable()
export class RecadoUltilsMock {
    inventerString() {
        return 'bla bla'
    }
}