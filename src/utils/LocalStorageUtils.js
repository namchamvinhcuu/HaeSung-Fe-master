const GetLocalStorage = (name) => {
  if (localStorage.getItem(name) !== 'undefined') {
    return JSON.parse(localStorage.getItem(name));
  }

  return null;
};

const SetLocalStorage = (name, value) => {
  localStorage.setItem(name, JSON.stringify(value));
};

const RemoveLocalStorage = (name) => {
  localStorage.removeItem(name);
};

export { GetLocalStorage, SetLocalStorage, RemoveLocalStorage };
