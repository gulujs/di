import { nanoid } from 'nanoid';

export class RandomStringFactory {
  static create(): string {
    return nanoid();
  }
}
