

export let removeSymbols = (string) => {
    for (let ch of string) {
      if (
        (ch.charCodeAt(0) > 32 && ch.charCodeAt(0) < 48) ||
        (ch.charCodeAt(0) >= 58 && ch.charCodeAt(0) <= 64) ||
        (ch.charCodeAt(0) >= 91 && ch.charCodeAt(0) <= 96) ||
        (ch.charCodeAt(0) >= 123 && ch.charCodeAt(0) <= 126)
      ) {
        string = string.replace(ch, "");
      }
    }
    return string;
  };
  
  export let removeWhiteAndSymbol = (string) => {
    for (let ch of string) {
      if (
        (ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) < 48) ||
        (ch.charCodeAt(0) >= 58 && ch.charCodeAt(0) <= 64) ||
        (ch.charCodeAt(0) >= 91 && ch.charCodeAt(0) <= 96) ||
        (ch.charCodeAt(0) >= 123 && ch.charCodeAt(0) <= 126)
      ) {
        string = string.replace(ch, "");
      }
    }
    return string;
  };
  
  export let removewhitespace = (string) => {
    for (let ch of string) {
      if (
        (ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) < 48) ||
        (ch.charCodeAt(0) >= 58 && ch.charCodeAt(0) <= 64) ||
        (ch.charCodeAt(0) >= 91 && ch.charCodeAt(0) <= 96) ||
        (ch.charCodeAt(0) >= 123 && ch.charCodeAt(0) <= 126)
      ) {
        string = string.replace(ch, "");
      }
    }
    return string;
  };
  
  export let removejustspace = (string) => {
    for (let ch of string) {
      if (ch.charCodeAt(0) == 32) {
        string = string.replace(ch, "");
      }
    }
    return string;
  };
  
  export let checkwhitespace = (string) => {
    let charcount = 0;
  
    for (let k = 0; k < string.length; k++) {
      if (string.charCodeAt(k) == 32) {
        charcount = charcount + 1;
      }
    }
  
    if (charcount == string.length) {
      return true;
    }
  };
  
  export let checkSymbols = (string) => {
    for (let ch of string) {
      if (
        (ch.charCodeAt(0) > 32 && ch.charCodeAt(0) <= 47) ||
        (ch.charCodeAt(0) >= 58 && ch.charCodeAt(0) <= 64) ||
        (ch.charCodeAt(0) >= 91 && ch.charCodeAt(0) <= 89) ||
        (ch.charCodeAt(0) >= 123 && ch.charCodeAt(0) <= 126)
      ) {
          return true;
        }
    }
  
  
  };
  
  
  export let checkBlankChars = (string) => {
    for (let ch of string) {
      if (
        (ch.charCodeAt(0) == 32 )
      ) {
          return true;
        }
    }
  
  
  };
  
  export let checkLowerCase = (string) => {
    for (let ch of string) {
      if (
        
        (ch.charCodeAt(0) >= 97 && ch.charCodeAt(0) <= 122) 
      ) {
          return true;
        }
    }
  
  
  };
  
  export let checkUpperCase = (string) => {
    for (let ch of string) {
      if (
        (ch.charCodeAt(0) >= 65 && ch.charCodeAt(0) <= 90)
      ) {
          return true;
        }
    }
  
  
  };
  
  export let checkNumbers = (string) => {
    for (let ch of string) {
      if (
        (ch.charCodeAt(0) >= 48 && ch.charCodeAt(0) <= 57)
      ) {
          return true;
        }
    }
  
  
  };
  
  export function sortAsc(arr) {
    for (let x in arr) {
      console.log(arr[x].charCodeAt(0));
  
      for (let y in arr) {
        if (arr[x].charCodeAt(0) < arr[y].charCodeAt(0)) {
          let temp = arr[x];
          arr[x] = arr[y];
          arr[y] = temp;
        }
      }
    }
    console.log(arr);
  }
  
  export let checkObjNum = (object) => {
    let count = 0;
    for (let num in object) {
      if (typeof object[num] == "number") {
        count = count + 1;
      }
    }
  
    if (count == Object.keys(object).length) {
      return true;
    } else {
      throw `numbers not found in the object`;
    }
  };
  
  export let checkArray = (array) => {
    if (Array.isArray(array)) {
      return true;
    }
  };
  
  export let checkStringinArray = (array) => {
    for (let element of array) {
      if (typeof element !== "string") {
        return true;
      }
    }
  };
  
  export let checkBlankStringinArray = (array) => {
    for (let element of array) {
      if (checkblankspace(element)) {
        return true;
      }
    }
  };

  export let validatePassword = (password) => {
    const passwordFormat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\d\s:])([^\s]){8,}$/
    return passwordFormat.test(password);
  }
  
  export let validateEmail =(email)=> {
    const mailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return mailformat.test(email);
  }
  
  