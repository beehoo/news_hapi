const Boom = require('@hapi/boom');
const { SQL_CODE } = require('../config');
const { filterKeys } = require('../utils');

/**
 * 查询标签
 * @param {String} id 标签id
 * @param {Array} ids 标签id（多个）
 * @param {Number} page 页码
 * @param {Number} limit 分页长度 
 */
const queryTags = async (request) => {
  const { db, ObjectID } = request.mongo;
  const payload = request.payload || {};

  // 查询条件
  const params = {};
  if (payload.id) {
    params._id = new ObjectID(payload.id);
  }
  if (payload.ids) {
    const objectIds = payload.ids.map(id => new ObjectID(id));
    params._id = { $in: objectIds };
  }

  // 分页
  const page = payload.page;
  const limit = payload.limit;

  try {
    const total = await db.collection('tags').count(params);
    const response = (page && limit) ?
      await db.collection('tags')
        .find(params)
        .sort({ createTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray() :
      await db.collection('tags')
        .find(params)
        .sort({ createTime: -1 })
        .toArray();
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
  const payload = request.payload || {};
  const params = {
    name: payload.name,
    color: payload.color || '',
    createTime: new Date()
  };

  try {
    const response = await db.collection('tags').insertOne(params);
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
  const payload = request.payload || {};
  // 查询条件
  const query = {
    _id: new ObjectID(payload.id)
  };

  // 过滤待修改参数，避免创建额外属性
  const keys = ['name', 'color'];
  const params = filterKeys(payload, keys, true);
  params.modTime = new Date(); // 修改时间

  try {
    const response = await db.collection('tags').updateOne(query, { $set: params });
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
  const payload = request.payload || {};
  // 查询条件
  const query = {
    _id: new ObjectID(payload.id)
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