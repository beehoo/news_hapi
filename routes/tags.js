const Joi = require('joi');
const tags = require('../server/tags');

const routes = [
  {
    method: 'POST',
    path: '/queryTags',
    config: {
      auth: false,
      tags: ['api'],
      description: '查询标签',
      notes: '查询标签',
      validate: {
        payload: Joi.object().keys({
          id: Joi.string().description('标签id'),
          ids: Joi.array().items(Joi.string()).description('标签id（多个）'),
          page: Joi.number().integer().description('分页'),
          limit: Joi.number().integer().description('分页长度')
        }).unknown().without('id', ['ids'])
      },
      response: {
        sample: 0,
        schema: Joi.array().items(Joi.object({
          _id: Joi.string().description('标签id'),
          name: Joi.string().description('标签名称'),
          color: Joi.string().description('标签颜色'),
          createTime: Joi.date().description('标签创建时间'),
          modTime: Joi.date().description('标签修改时间'),
        }))
      }
    },
    handler: tags.queryTags
  },
  {
    method: 'POST',
    path: '/createTag',
    config: {
      auth: false,
      tags: ['api'],
      description: '创建标签',
      notes: '创建标签',
      validate: {
        payload: Joi.object().keys({
          name: Joi.string().required().description('标签名称'),
          color: Joi.string().allow('').description('标签颜色'),
        })
      },
      response: {
        sample: 0,
        schema: Joi.object({
          insertedId: Joi.string().description('新增标签id')
        })
      }
    },
    handler: tags.createTag
  },
  {
    method: 'POST',
    path: '/updateTag',
    config: {
      auth: false,
      tags: ['api'],
      description: '修改标签',
      notes: '修改标签',
      validate: {
        payload: Joi.object().keys({
          id: Joi.string().required().description('标签id'),
          name: Joi.string().description('标签名称'),
          color: Joi.string().description('标签颜色')
        })
      }
    },
    handler: tags.updateTag
  },
  {
    method: 'POST',
    path: '/deleteTag',
    config: {
      auth: false,
      tags: ['api'],
      description: '删除标签',
      notes: '删除标签',
      validate: {
        payload: Joi.object().keys({
          id: Joi.string().required().description('标签id'),
        })
      }
    },
    handler: tags.deleteTag
  }
];

module.exports = routes;