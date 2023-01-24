import { dontReturnEmpty } from '../../src/utils/dont-return-empty';

describe('dontReturnEmpty', () => {
  it('returns properties if any are defined', () => {
    const input: any = {
      a: 1,
      b: undefined,
      c: null,
      d: {},
      e: []
    };

    const output = dontReturnEmpty(input);

    expect(output).toEqual(input);
  });
  it('returns undefined if all are empty', () => {
    const input: any = {
      a: undefined,
      b: undefined,
      c: null,
      d: {},
      e: []
    };

    const output = dontReturnEmpty(input);

    expect(output).toEqual(undefined);
  });
  it('works on nested objects', () => {
    const input: any = {
      a: undefined,
      b: undefined,
      c: null,
      d: {},
      e: [],
      f: {
        g: [],
        h: {},
        i: [{}]
      },
      j: [{ k: [] }, []]
    };

    const output = dontReturnEmpty(input);

    expect(output).toEqual(undefined);
  });
});