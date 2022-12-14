const Boom = require('@hapi/boom');
const { SQL_CODE } = require('../config');
const { filterKeys } = require('../utils');

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
  const params = request.payload || {};
  const result = {
    phone: params.phone || '',
    password: params.password || '',
    nick: params.nick || '',
    udesc: params.udesc || '',
    avatar: params.avatar || '',
    gender: params.gender || 1,
    birthday: params.birthday || ''
  }

  try {
    // 判断手机号是否已注册
    const user = await db.collection('users').findOne({ phone: params.phone });
    if (user) {
      return { code: SQL_CODE.FAILURE, msg: '该手机号已注册' };
    }

    const response = await db.collection('users').insertOne(result);
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
  const db = request.mongo.db;
  const ObjectID = request.mongo.ObjectID;
  const params = request.payload || {};

  // 查询条件
  const query = {
    _id: new ObjectID(params.id)
  };
  // 过滤待修改参数，避免创建额外属性
  const keys = ['password', 'nick', 'udesc', 'avatar', 'gender', 'birthday'];
  const result = filterKeys(params, keys, true);

  try {
    const response = await db.collection('users').updateOne(query, { $set: result });
    return { code: SQL_CODE.SUCCESS, data: response };
  } catch (err) {
    throw Boom.internal('Internal MongoDB error', err);
  }
}

module.exports = {
  createUser,
  updateUser
};