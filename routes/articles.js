const Joi = require('joi');
const articles = require('../server/articles');

const routes = [
  {
    method: 'GET',
    path: '/queryArticles',
    config: {
      auth: false,
      tags: ['api'],
      description: '查询文章',
      notes: '查询文章',
      validate: {
        query: Joi.object().keys({
          id: Joi.string().description('文章id'),
          flag: Joi.number().description('文章状态，0为未发布，1为已发布'),
          search: Joi.string().description('搜索内容，模糊查询文章标题、简介或内容'),
          page: Joi.number().integer().description('分页'),
          limit: Joi.number().integer().description('分页长度')
        }).unknown()
      },
      response: {
        sample: 0,
        schema: Joi.array().items(Joi.object({
          id: Joi.number().description('文章id'),
          title: Joi.string().description('文章标题'),
          cover: Joi.string().uri().description('文章封面图'),
          author: Joi.string().description('文章作者'),
          intro: Joi.string().description('文章简介'),
          cont: Joi.string().description('文章内容'),
          flag: Joi.number().valid(0, 1).description('文章状态，0为未发布，1为已发布'),
          createTime: Joi.date().description('文章创建时间')
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
        payload: Joi.object({
          title: Joi.string().required().description('文章标题'),
          cover: Joi.string().uri().allow('').description('文章封面图'),
          author: Joi.string().allow('').description('文章作者'),
          intro: Joi.string().allow('').description('文章简介'),
          cont: Joi.string().required().description('文章内容'),
          flag: Joi.number().valid(0, 1).description('文章状态，0为未发布，1为已发布'),
        })
      },
      response: {
        sample: 0,
        schema: Joi.object({
          insertedId: Joi.number().description('新增文章id')
        })
      }
    },
    handler: articles.createArticle
  }
];

module.exports = routes;