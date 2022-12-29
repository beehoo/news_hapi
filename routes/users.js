const Joi = require('joi');
const users = require('../server/users');

const routes = [
  {
    method: 'GET',
    path: '/queryUsers',
    config: {
      auth: false,
      tags: ['api'],
      description: '查询用户',
      notes: '查询用户',
      validate: {
        query: Joi.object({
          id: Joi.string().description('用户id'),
          nick: Joi.string().description('用户昵称，模糊查询'),
          phone: Joi.string().description('手机号'),
          page: Joi.number().integer().description('页码'),
          limit: Joi.number().integer().description('分页长度')
        }),
      },
      response: {
        sample: 0,
        schema: Joi.object({
          _id: Joi.number().description('用户id'),
          nick: Joi.string().description('用户昵称'),
          phone: Joi.string().description('用户手机号'),
          udesc: Joi.string().description('用户简介'),
          avatar: Joi.string().uri().description('用户头像'),
          gender: Joi.number().valid(0, 1).description('用户性别，0位女，1为男'),
          birthday: Joi.date().description('用户生日')
        })
      }
    },
    handler: users.queryUsers
  },
  {
    method: 'POST',
    path: '/createUser',
    config: {
      auth: false,
      tags: ['api'],
      description: '创建用户',
      notes: '创建新用户',
      validate: {
        payload: Joi.object({
          phone: Joi.string().required().description('用户手机号'),
          password: Joi.string().description('用户密码'),
          nick: Joi.string().allow('').description('用户昵称'),
          udesc: Joi.string().allow('').description('用户简介'),
          avatar: Joi.string().allow('').description('用户头像'),
          gender: Joi.number().valid(0, 1).description('用户性别，0为女，1为男'),
          birthday: Joi.date().description('用户生日')
        })
      },
      response: {
        sample: 0,
        schema: Joi.object({
          insertedId: Joi.number().description('新增用户id')
        })
      }
    },
    handler: users.createUser
  },
  {
    method: 'POST',
    path: '/updateUser',
    config: {
      auth: false,
      tags: ['api'],
      description: '更新用户',
      notes: '更新用户信息',
      validate: {
        payload: Joi.object({
          id: Joi.string().required().description('用户id'),
          password: Joi.string().description('用户密码'),
          nick: Joi.string().allow('').description('用户昵称'),
          udesc: Joi.string().allow('').description('用户简介'),
          avatar: Joi.string().allow('').description('用户头像'),
          gender: Joi.number().valid(0, 1).description('用户性别，0为女，1为男'),
          birthday: Joi.date().description('用户生日')
        })
      }
    },
    handler: users.updateUser
  },
  {
    method: 'POST',
    path: '/deleteUser',
    config: {
      auth: false,
      tags: ['api'],
      description: '删除用户',
      notes: '删除用户',
      validate: {
        payload: Joi.object({
          id: Joi.string().required().description('用户id')
        })
      }
    },
    handler: users.deleteUser
  }
];

module.exports = routes;