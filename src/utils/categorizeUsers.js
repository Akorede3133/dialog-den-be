const categorizeUsers = (users) => {
  return users.reduce((accumulator, user) => {
    const { id, username, email } = user;
    const userInfo = { id, username, email };
    const userFirstLetter = username[0];
    if (!accumulator[userFirstLetter]) {
      accumulator[userFirstLetter] = [];
    }
    accumulator[userFirstLetter].push(userInfo)
    return accumulator;
  }, {})
}

export default categorizeUsers;