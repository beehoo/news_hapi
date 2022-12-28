const Joi = require('joi');
const articles = require('../server/articles');

const routes = [
  {
    method: 'POST',
    path: '/queryArticles',
    config: {
      auth: false,
      tags: ['api'],
      description: '查询文章',
      notes: '查询文章',
      validate: {
        payload: Joi.object().keys({
          id: Joi.string().description('文章id'),
          flag: Joi.number().description('文章状态，0为未发布，1为已发布'),
          search: Joi.string().description('搜索内容，模糊查询文章标题、简介或内容'),
          tags: Joi.array().items(Joi.string()).description('文章标签'),
          page: Joi.number().integer().description('分页'),
          limit: Joi.number().integer().description('分页长度')
        }).unknown()
      },
      response: {
        sample: 0,
        schema: Joi.array().items(Joi.object({
          _id: Joi.string().description('文章id'),
          title: Joi.string().description('文章标题'),
          cover: Joi.string().uri().description('文章封面图'),
          author: Joi.string().description('文章作者'),
          intro: Joi.string().description('文章简介'),
          cont: Joi.string().description('文章内容'),
          tags: Joi.array().description('文章标签'),
          flag: Joi.number().valid(0, 1).description('文章状态，0为未发布，1为已发布'),
          createTime: Joi.date().description('文章创建时间'),
          modTime: Joi.date().description('文章修改时间'),
        }))
      }
    },
    handler: articles.queryArticles
  },
  {
    method: 'POST',
    path: '/createArticle',
    config: {
      auth: false,
      tags: ['api'],
      description: '创建文章',
      notes: '创建文章',
      validate: {
        payload: Joi.object().keys({
          title: Joi.string().required().description('文章标题'),
          cover: Joi.string().uri().allow('').description('文章封面图'),
          author: Joi.string().allow('').description('文章作者'),
          intro: Joi.string().allow('').description('文章简介'),
          tags: Joi.array().items(Joi.string()).description('文章标签'),
          cont: Joi.string().required().description('文章内容'),
          flag: Joi.number().valid(0, 1).description('文章状态，0为未发布，1为已发布'),
        })
      },
      response: {
        sample: 0,
        schema: Joi.object({
          insertedId: Joi.string().description('新增文章id')
        })
      }
    },
    handler: articles.createArticle
  },
  {
    method: 'POST',
    path: '/updateArticle',
    config: {
      auth: false,
      tags: ['api'],
      description: '修改文章',
      notes: '修改文章',
      validate: {
        payload: Joi.object().keys({
          id: Joi.string().required().description('文章id'),
          title: Joi.string().description('文章标题'),
          cover: Joi.string().uri().allow('').description('文章封面图'),
          intro: Joi.string().allow('').description('文章简介'),
          tags: Joi.array().items(Joi.string()).description('文章标签'),
          cont: Joi.string().description('文章内容'),
          flag: Joi.number().valid(0, 1).description('文章状态，0为未发布，1为已发布'),
        })
      }
    },
    handler: articles.updateArticle
  },
  {
    method: 'POST',
    path: '/deleteArticle',
    config: {
      auth: false,
      tags: ['api'],
      description: '删除文章',
      notes: '删除文章',
      validate: {
        payload: Joi.object().keys({
          id: Joi.string().required().description('文章id'),
        })
      }
    },
    handler: articles.deleteArticle
  }
];

module.exports = routes;