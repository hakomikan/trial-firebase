// import { } from './Task';

export class Task {
  public name : string;

  constructor(name: string) {
    this.name = name
  }
}

it('renders without crashing', () => {
  const v = new Task("unknown");
  expect(v.name).toEqual("unknown")
});

