
//create
function create(req, res, next) {
  res.status(201).json({message:'create user', data:{}});
}
//find
function list(req, res, next) {
  res.json({message:'list users', data:[]});
}
//find by id
function find(req, res, next) {
  res.json({message:'find a user by id', data:{}});
}
//update
function update(req, res, next) {
  res.json({message:'update user by id', data:{}});
}
//destroy
function destroy(req, res, next) {
  res.json({message:'delete user by id',data:{}});
}


module.exports = {create, list, find, update, destroy}