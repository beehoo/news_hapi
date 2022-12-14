/**
 * 过滤对象
 * @param {*} obj 查询参数对象
 * @param {Array} keys 需要排除或保留的的keys
 * @param {Boolean} flag false为排除keys，true为保留keys
 * @returns 
 */
const filterKeys = (obj, keys, flag) => {
  const filtered = Object.keys(obj)
    .filter(key => flag ? keys.includes(key) : !keys.includes(key))
    .reduce((newObj, key) => {
      newObj[key] = obj[key];
      return newObj;
    }, {});
  return filtered;
}

module.exports = {
  filterKeys
}