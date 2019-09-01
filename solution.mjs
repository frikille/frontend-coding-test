export const add = (...numbers) => numbers.reduce((a, b) => a + b, 0);

const addLeadingZero = value => (value < 10 ? `0${value}` : value);

const convertTimestampToDate = timestampStr => {
  const timestamp = parseInt(timestampStr.substr(2), 10);
  const date = new Date(timestamp);

  const day = addLeadingZero(date.getDate());
  const month = addLeadingZero(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const getValue = value => {
  if (typeof value === "object") {
    return deserialize(value);
  }

  if (/^t:\d+$/.test(value)) {
    return convertTimestampToDate(value);
  }

  return value;
};

export const deserialize = object => {
  return Object.entries(object).reduce((result, [key, value]) => {
    const matches = key.match(/^(\w+)(\d+)_(\w+)$/);

    if (!matches || matches.length < 4) {
      result[key] = value;

      return result;
    }

    const [_, arrayKey, arrayIndexStr, objKey] = matches;

    if (!result[arrayKey]) {
      result[arrayKey] = [];
    }

    const index = parseInt(arrayIndexStr, 10);

    result[arrayKey][index] = {
      ...result[arrayKey][index],
      [objKey]: getValue(value)
    };

    return result;
  }, {});
};

export const listToObject = list => {
  return list.reduce((result, { name, value }) => {
    result[name] = dereferenceValue(value);

    return result;
  }, {});
};

const dereferenceValue = value => {
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return [...value];
    }

    return { ...value };
  }

  return value;
};

export const objectToList = obj => {
  return Object.entries(obj).reduce((result, [key, value]) => {
    result.push({
      name: key,
      value: dereferenceValue(value)
    });

    return result;
  }, []);
};
