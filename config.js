/** 数据库信息 */
const dbUrl = 'mongodb://localhost:27017/news';
/** 状态码 */
const SQL_CODE = { FAILURE: -1, SUCCESS: 0 };
/** jwt秘钥 */
const JWTSecret = 'newshapi';
/** 时区 */
const timezone = '+08:00'

module.exports = {
  dbUrl,
  SQL_CODE,
  JWTSecret,
  timezone
};