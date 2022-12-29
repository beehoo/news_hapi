const Boom = require('@hapi/boom');
const { SQL_CODE, timezone } = require('../config');
const { filterKeys } = require('../utils');

/**
 * 查询文章
 * @param {String} id 文章id
 * @param {Number} flag 文章状态，0或1
 * @param {String} search 搜索内容，模糊查询文章标题、简介和内容
 * @param {Array} tags 标签
 * @param {String} startTime 发布开始时间
 * @param {String} endTime 发布结束时间
 * @param {Number} page 分页
 * @param {Number} limit 分页长度
 */
const queryArticles = async (request) => {
  const { db, ObjectID } = request.mongo;
  const payload = request.payload || {};

  // 查询条件
  const params = {};
  if (payload.id) {
    params._id = new ObjectID(payload.id);
  }
  if (payload.flag) {
    params.flag = parseInt(payload.flag);
  }
  if (payload.search) {
    params.$or = [
      { title: { $regex: payload.search } },
      { intro: { $regex: payload.search } },
      { cont: { $regex: payload.search } }
    ];
  }
  if (payload.tags) {
    params.tags = { $in: payload.tags }
  }
  if (payload.startTime && payload.endTime) {
    params.publishTime = {
      $gte: new Date(payload.startTime),
      $lte: new Date(payload.endTime)
    }
  }

  // 聚合操作，关联tags对应数据
  const pipeline = [
    { $match: params }, // 查询数据
    {
      $addFields: {
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: { $toObjectId: '$$tag' }
          }
        },
        publishTime: {
          $dateToString: {
            format: '%Y-%m-%d %H:%M:%S',
            date: '$publishTime',
            timezone: timezone
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
    { $sort: { publishTime: -1, createTime: -1 } } // 排序，按发布时间和创建时间降序
  ]
  // 分页
  if (payload.page && payload.limit) {
    pipeline.push(
      { $skip: (payload.page - 1) * payload.limit },
      { $limit: payload.limit }
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
  const payload = request.payload || {};
  const params = {
    title: payload.title,
    cover: payload.cover || '',
    author: payload.author || '',
    intro: payload.intro || '',
    tags: payload.tags || [],
    cont: payload.cont,
    flag: payload.flag || 0,
    publishTime: payload.flag ? new Date() : '', // 发布时间
    createTime: new Date() // 创建时间
  };

  try {
    const response = await db.collection('articles').insertOne(params);
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
  const payload = request.payload || {};
  // 查询条件
  const query = {
    _id: new ObjectID(payload.id)
  };

  // 过滤待修改参数，避免创建额外属性
  const keys = ['title', 'cover', 'intro', 'tags', 'cont', 'flag'];
  const params = filterKeys(payload, keys, true);
  // 发布时间
  if (payload.flag && !payload.publishTime) {
    params.publishTime = new Date();
  }
  // 修改时间
  params.modTime = new Date();

  try {
    const response = await db.collection('articles').updateOne(query, { $set: params });
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
  const payload = request.payload || {};
  // 查询条件
  const query = {
    _id: new ObjectID(payload.id)
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