const GetLocalStorage = (name) => {
    return JSON.parse(localStorage.getItem(name)) ?? null;
};

const SetLocalStorage = (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
};

const RemoveLocalStorage = (name) => {
    localStorage.removeItem(name);
};

export {
    GetLocalStorage,
    SetLocalStorage,
    RemoveLocalStorage
}