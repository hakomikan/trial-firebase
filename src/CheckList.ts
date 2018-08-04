import { Task } from "./Task.test";

export class CheckList {
  public name: string;
  public tasks: Task[];

  constructor(name: string) {
    this.name = name;
  }
}