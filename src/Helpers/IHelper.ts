import { Element } from "../element";

export interface IHelper {
   getElements(): Promise<Element[]>;
}