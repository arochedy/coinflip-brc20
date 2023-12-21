import axios from "axios";

export const GetLeaderboards = async () => {
  return await axios.get(`https://flickthebean.onrender.com/leaderboard`, {
  }).then(function (res) {
    return res.data.data;
  }).catch(function (error) {
    // console.log(error.toJSON());
  });
}