const categorizeUsers = (users) => {
  return users.reduce((accumulator, user) => {
    const { id, username, email, photo } = user;
    const userInfo = { id, username, email, photo };
    const userFirstLetter = username[0];
    if (!accumulator[userFirstLetter]) {
      accumulator[userFirstLetter] = [];
    }
    accumulator[userFirstLetter].push(userInfo)
    return accumulator;
  }, {})
}

export default categorizeUsers;