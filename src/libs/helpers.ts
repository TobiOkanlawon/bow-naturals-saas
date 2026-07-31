export const capitalize = (str: string) => {
  const capitalFirstLetter = str.charAt(0).toUpperCase();
  const restOfString = str.slice(1);

  return capitalFirstLetter.concat(restOfString);
};
