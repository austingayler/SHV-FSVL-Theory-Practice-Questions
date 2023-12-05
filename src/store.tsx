import AsyncStorage from "@react-native-async-storage/async-storage";

const writeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.log("Error writing data with AsyncStorage");
    console.log({ key, value });

    try {
      if (localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.log("Error writing data with localStorage");
      console.log({ key, value });
    }
  }
};

const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);

    if (value !== null) {
      // value previously stored
      return value;
    }

    return "";
  } catch (e) {
    console.log("Error getting data with AsyncStorage");
    console.log({ key });
    console.log(e);

    try {
      if (localStorage) {
        const val = localStorage.getItem(key);
        return val || "";
      }
    } catch (e) {
      console.log("Error getting data with localStorage");
    }

    return "";
  }
};

export default {
  writeData,
  getData,
};
