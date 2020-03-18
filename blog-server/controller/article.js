const Article = require('../model/article')
const Op = require('sequelize').Op

const item = async (ctx) => {
    const where = {
        id: ctx.query.id
    }
    const data = await Article.findOne({where})
    data.tag = data.tag.split(',')
    data.category = data.category.split(',')
    ctx.body = {
        code: 1000,
        data
    }
}

const detail = async (ctx) => {
    const where = {
        id: ctx.query.id
    }
    let { readedCount } = await Article.findOne({where})
    readedCount++
    await Article.update({readedCount}, {where})
    const data = await Article.findOne({where})
    data.tag = data.tag.split(',')
    data.category = data.category.split(',')
    ctx.body = {
        code: 1000,
        data
    }
}

const list = async (ctx) => {
    const query = ctx.query
    const where = {
        title: {
            [Op.like]: `%${query.title || ''}%`
        }
    }
    const {rows: data, count: total} = await Article.findAndCountAll({
        where,
        offset: (+query.pageNo - 1) * +query.pageSize,
        limit: +query.pageSize,
        order: [
            ['createdAt', 'DESC']
        ]
    })
    data.forEach(v => {
        v.tag = v.tag.split(',')
        v.category = v.category.split(',')
    })
    ctx.body = {
        data,
        total,
        code: 1000,
        desc: 'suc'
    }
}

const listAll = async (ctx) => {
    const data = await Article.findAll({
        order: [
            ['createdAt', 'DESC']
        ]
    })
    ctx.body = {
        code: 1000,
        data
    }
}

const update = async ctx => {
    const { id, title, author, summary, category,
            tag, content } = ctx.request.body
    const data = await Article.update(
        { id, title, author, summary, category, tag, content },
        { where: {id} }
    )
    ctx.body = {
        code: 1000,
        data,
        desc: 'update suc'
    }
}

const create = async (ctx) => {
    const params = ctx.request.body
    if (!params.title) {
        ctx.body = {
          code: 1003,
          desc: 'title can not be null'
        }
        return false
    }
    try {
        await Article.create(params)
        ctx.body = {
            code: 1000,
            data: 'create suc'
        }
    }
    catch(err) {
        const msg = err.errors[0]
        ctx.body = {
            code: 300,
            data: msg.value + msg.message
        }
    }
}

const destroy = async (ctx) => {
    await Article.destroy({where: ctx.request.body})
    ctx.body = {
        code: 1000,
        desc: 'destroy suc'
    }
}

module.exports = {
    create,
    destroy,
    update,
    detail,
    item,
    list,
    listAll
}