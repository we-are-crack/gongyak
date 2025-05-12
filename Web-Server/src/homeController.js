export const home = (req, res) => {
  console.log('home controller called'); // 디버깅용 로그
  res.send('Welcome to the home page!');
};
