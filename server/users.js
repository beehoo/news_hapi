const Boom = require('@hapi/boom');
const { SQL_CODE } = require('../config');
const { filterKeys } = require('../utils');

/**
 * 查询用户
 * @param {String} id 用户id
 * @param {String} nick 用户昵称，模糊查询
 * @param {String} phone 手机号
 * @param {Number} page 页码
 * @param {Number} limit 分页长度
 */
const queryUsers = async (request) => {
  const { db, ObjectID } = request.mongo;
  const query = request.query || {};

  // 查询条件
  const params = {};
  if (query.id) {
    params._id = new ObjectID(query.id);
  }
  if (query.nick) {
    params.nick = { $regex: query.nick };
  }
  if (query.phone) {
    params.phone = query.phone;
  }

  // 聚合操作
  const pipeline = [
    { $match: params },
    { $project: { password: 0 } }, // 不返回密码信息
    {
      $addFields: {
        phone: { // 格式化手机号
          $concat: [
            { $substr: ['$phone', 0, 3] },
            '****',
            { $substr: ['$phone', 7, 11] }
          ]
        }
      }
    },
    { $sort: { createTime: -1 } } // 按创建时间降序
  ]
  // 分页
  if (query.page && query.limit) {
    pipeline.push(
      { $skip: (query.page - 1) * query.limit },
      { $limit: query.limit }
    )
  }

  try {
    const total = await db.collection('users').count(params);
    const response = await db.collection('users').aggregate(pipeline).toArray();
    return { code: SQL_CODE.SUCCESS, total: total, data: response };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

/** 
 * 创建用户
 * @param {String} phone 用户手机号
 * @param {String} password 用户密码
 * @param {String} nick 昵称
 * @param {String} udesc 简介
 * @param {String} avatar 头像
 * @param {Number} gender 性别，0为女，1为男
 * @param {String} birthday 生日
 */
const createUser = async (request) => {
  const db = request.mongo.db;
  const payload = request.payload || {};
  const params = {
    phone: payload.phone || '',
    password: payload.password || '',
    nick: payload.nick || '',
    udesc: payload.udesc || '',
    avatar: payload.avatar || '',
    gender: payload.gender || 1,
    birthday: payload.birthday || '',
    createTime: new Date()
  }

  try {
    // 判断手机号是否已注册
    const user = await db.collection('users').findOne({ phone: payload.phone });
    if (user) {
      return { code: SQL_CODE.FAILURE, msg: '该手机号已注册' };
    }

    const response = await db.collection('users').insertOne(params);
    return { code: SQL_CODE.SUCCESS, data: { insertedId: response.insertedId } };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

/**
 * 修改用户
 * @param {String} id 用户id
 * @param {String} password 用户密码
 * @param {String} nick 用户昵称
 * @param {String} udesc 用户简介
 * @param {String} avatar 用户头像
 * @param {Number} gender 性别，0为女，1为男
 * @param {String} birthday 生日 
 */
const updateUser = async (request) => {
  const { db, ObjectID } = request.mongo;
  const payload = request.payload || {};

  // 查询条件
  const query = {
    _id: new ObjectID(payload.id)
  };
  // 过滤待修改参数，避免创建额外属性
  const keys = ['password', 'nick', 'udesc', 'avatar', 'gender', 'birthday'];
  const params = filterKeys(payload, keys, true);
  params.modTime = new Date(); // 修改时间

  try {
    const response = await db.collection('users').updateOne(query, { $set: params });
    return { code: SQL_CODE.SUCCESS, data: response };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

/**
 * 删除用户
 * @param {String} id 用户id
 */
const deleteUser = async (request) => {
  const { db, ObjectID } = request.mongo;
  const payload = request.payload || {};

  // 查询条件
  const query = {
    _id: new ObjectID(payload.id)
  };

  try {
    const response = await db.collection('users').deleteOne(query);
    return { code: SQL_CODE.SUCCESS, data: response };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

module.exports = {
  queryUsers,
  createUser,
  updateUser,
  deleteUser
};