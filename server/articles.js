const Boom = require('@hapi/boom');
const { SQL_CODE } = require('../config');
const dayjs = require('dayjs');

/**
 * 查询文章
 * @param {String} id 文章id
 * @param {Number} flag 文章状态，0或1
 * @param {String} search 搜索内容，模糊查询文章标题、简介和内容
 * @param {Number} page 分页
 * @param {Number} limit 分页长度
 */
const queryArticles = async (request) => {
  const db = request.mongo.db;
  const ObjectID = request.mongo.ObjectID;
  const query = request.query || {};

  // 查询条件
  const params = {};
  if (query.id) {
    params._id = new ObjectID(query.id);
  }
  if (query.flag) {
    params.flag = parseInt(query.flag);
  }
  if (query.search) {
    params.$or = [
      { title: { $regex: query.search } },
      { intro: { $regex: query.search } },
      { cont: { $regex: query.search } }
    ];
  }

  // 分页
  const page = params.page;
  const limit = params.limit;

  try {
    const total = await db.collection('articles').count(params);
    const response = (page && limit)
      ? await db.collection('articles').find(params)
        .skip((page - 1) * limit)
        .limit(limit).toArray()
      : await db.collection('articles').find(params).toArray();
    return { code: SQL_CODE.SUCCESS, total: total, data: response };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

/**
 * 创建文章
 * @param {String} title 文章标题
 * @param {String} cover 文章封面图
 * @param {String} author 作者
 * @param {String} intro 简介
 * @param {String} cont 文章内容
 * @param {Number} flag 状态，0为未发布，1为已发布
 * @param {String} createTime 创建时间
 */
const createArticle = async (request) => {
  const db = request.mongo.db;
  const params = request.payload || {};
  const result = {
    title: params.title,
    cover: params.cover || '',
    author: params.author || '',
    intro: params.intro || '',
    cont: params.cont,
    flag: params.flag || 0,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  };

  try {
    const response = await db.collection('articles').insertOne(result);
    return { code: SQL_CODE.SUCCESS, data: { insertedId: response.insertedId } };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

module.exports = {
  queryArticles,
  createArticle
};