const Boom = require('@hapi/boom');
const { SQL_CODE } = require('../config');
const { filterKeys } = require('../utils');
const dayjs = require('dayjs');

/**
 * 查询标签
 * @param {String} id 标签id
 * @param {Array} ids 标签id（多个）
 */
const queryTags = async (request) => {
  const { db, ObjectID } = request.mongo;
  const query = request.payload || {};

  // 查询条件
  const params = {};
  if (query.id) {
    params._id = new ObjectID(query.id);
  }
  if (query.ids) {
    const objectIds = query.ids.map(id => new ObjectID(id));
    params._id = { $in: objectIds };
  }

  // 分页
  const page = params.page;
  const limit = params.limit;

  try {
    const total = await db.collection('tags').count(params);
    const response = (page && limit)
      ? await db.collection('tags').find(params)
        .skip((page - 1) * limit)
        .limit(limit).toArray()
      : await db.collection('tags').find(params).toArray();
    return { code: SQL_CODE.SUCCESS, total: total, data: response };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

/**
 * 创建标签
 * @param {String} name 标签名称
 * @param {String} color 标签颜色
 */
const createTag = async (request) => {
  const db = request.mongo.db;
  const params = request.payload || {};
  const result = {
    name: params.name,
    color: params.color || '',
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  };

  try {
    const response = await db.collection('tags').insertOne(result);
    return { code: SQL_CODE.SUCCESS, data: { insertedId: response.insertedId } };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

/**
 * 修改标签
 * @param {String} id 标签id
 * @param {String} name 标签名称
 * @param {String} color 标签颜色
 */
const updateTag = async (request) => {
  const { db, ObjectID } = request.mongo;
  const params = request.payload || {};
  // 查询条件
  const query = {
    _id: new ObjectID(params.id)
  };

  // 过滤待修改参数，避免创建额外属性
  const keys = ['name', 'color'];
  const result = filterKeys(params, keys, true);
  result.modTime = dayjs().format('YYYY-MM-DD HH:mm:ss'); // 修改时间

  try {
    const response = await db.collection('tags').updateOne(query, { $set: result });
    return { code: SQL_CODE.SUCCESS, data: response };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

/**
 * 删除标签
 * @param {String} id 标签id
 */
const deleteTag = async (request) => {
  const { db, ObjectID } = request.mongo;
  const params = request.payload || {};
  // 查询条件
  const query = {
    _id: new ObjectID(params.id)
  };

  try {
    const response = await db.collection('tags').deleteOne(query);
    return { code: SQL_CODE.SUCCESS, data: response };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

module.exports = {
  queryTags,
  createTag,
  updateTag,
  deleteTag
}