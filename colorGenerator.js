exports.colorCode = function () {
  const hexaList = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ];
  let color = "#";
  while (color.length < 7) {
    const index = Math.floor(Math.random() * 15);
    color += hexaList[index];
  }
  console.log(color);
  return color;
};
