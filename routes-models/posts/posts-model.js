//connection to database
const db = require('../../data/db-config')

module.exports = {
    add,
    find,
    findBy,
    findById,
    update,
    remove

}

function find() {
    return db('posts').select('id', 'title', 'content', 'user_id');
  }

async function add(post){
    const[id] = await db('posts').insert(post)

    return findById(id)
}

function findById(id){
    return db('posts')
        .where({id})
        .first()
}

function findBy(filter){
    return db('posts').where(filter)
}

function update(change, id){
    return db('posts')
    .update(change)
    .where({id: id})
    //resolve to count records updated
}

function remove(id){
    return db('posts')
    .delete(id)
    .where({id: id})
}