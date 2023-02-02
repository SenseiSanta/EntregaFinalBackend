import { Container } from "../container/Container.js";
import { generateProduct } from "../utils/generateProduct.js";

export class productMock extends Container {
    
    constructor() {
        super()
    }

    generateData(cant = 5) {
        let listaDatos = []
        for (let i = 0; i < cant; i++) {
            listaDatos.push(generateProduct())
        }
        return listaDatos
    }
}