import { } from './Task';

it('renders without crashing', () => {
  const v = new Task("unknown");
  expect(v.name).toEqual("unknown")
});

