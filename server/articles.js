const Boom = require('@hapi/boom');
const { SQL_CODE } = require('../config');
const { filterKeys } = require('../utils');
const dayjs = require('dayjs');

/**
 * 查询文章
 * @param {String} id 文章id
 * @param {Number} flag 文章状态，0或1
 * @param {String} search 搜索内容，模糊查询文章标题、简介和内容
 * @param {Array} tags 标签
 * @param {Number} page 分页
 * @param {Number} limit 分页长度
 */
const queryArticles = async (request) => {
  const { db, ObjectID } = request.mongo;
  const query = request.payload || {};

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
  if (query.tags) {
    params.tags = { $in: query.tags }
  }

  // 聚合操作
  const pipeline = [
    { $match: params },
    {
      $addFields: {
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: { $toObjectId: '$$tag' }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'tags',
        localField: 'tags',
        foreignField: '_id',
        as: 'tags'
      }
    },
  ]

  if (params.page && params.limit) {
    pipeline.push(
      { $skip: (params.page - 1) * params.limit },
      { $limit: params.limit }
    )
  }

  try {
    const total = await db.collection('articles').count(params);
    const response = await db.collection('articles').aggregate(pipeline).toArray();
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
 * @param {Array} tags 文章标签
 * @param {String} cont 文章内容
 * @param {Number} flag 状态，0为未发布，1为已发布
 */
const createArticle = async (request) => {
  const db = request.mongo.db;
  const params = request.payload || {};
  const result = {
    title: params.title,
    cover: params.cover || '',
    author: params.author || '',
    intro: params.intro || '',
    tags: params.tags || [],
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

/**
 * 修改文章
 * @param {String} id 文章id
 * @param {String} title 文章标题
 * @param {String} cover 文章封面图
 * @param {String} intro 简介
 * @param {String} tags 文章标签
 * @param {String} cont 文章内容
 * @param {Number} flag 状态，0为未发布，1为已发布
 */
const updateArticle = async (request) => {
  const { db, ObjectID } = request.mongo;
  const params = request.payload || {};
  // 查询条件
  const query = {
    _id: new ObjectID(params.id)
  };

  // 过滤待修改参数，避免创建额外属性
  const keys = ['title', 'cover', 'intro', 'tags', 'cont', 'flag'];
  const result = filterKeys(params, keys, true);
  result.modTime = dayjs().format('YYYY-MM-DD HH:mm:ss'); // 修改时间

  try {
    const response = await db.collection('articles').updateOne(query, { $set: result });
    return { code: SQL_CODE.SUCCESS, data: response };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

/**
 * 删除文章
 * @param {String} id 文章id
 */
const deleteArticle = async (request) => {
  const { db, ObjectID } = request.mongo;
  const params = request.payload || {};
  // 查询条件
  const query = {
    _id: new ObjectID(params.id)
  };

  try {
    const response = await db.collection('articles').deleteOne(query);
    return { code: SQL_CODE.SUCCESS, data: response };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

module.exports = {
  queryArticles,
  createArticle,
  updateArticle,
  deleteArticle
};