describe('Filter function', () => {
  test('demo', () => {
    const input = [1, 2, 3];
    const output = 1;

    expect(((inp) => inp[0])(input)).toEqual(output);
  });
});
