import { SimpleCartProductInfo } from "../types/SimpleCart";

export class SimpleCartInventoryModel {
    constructor() {}
  
    fetchInventories() {
      try {
        // access RDBMS or perform GET API request here - from BFF
        const defaultData: SimpleCartProductInfo[] = [
            {sku: "Q5331242342", name: "BlueBull", qty: 3, price: 3.50},
            {sku: "A5331242342", name: "LipoVitamin D", qty: 1, price: 4.50},
            {sku: "S5331242342", name: "NesKaffee", qty: 5, price: 14},
            {sku: "F5331242342", name: "LipTea", qty: 4, price: 12},
        ];

        return defaultData;
      } catch(error) {
        console.error("Error fetching inventories:", error);

        throw error;
      } 
    }
}
