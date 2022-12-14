const Joi = require('joi');
const users = require('../server/users');

const routes = [
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
  }
];

module.exports = routes;