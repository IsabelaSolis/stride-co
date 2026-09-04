
//create
function create(req, res, next) {
  res.status(201).json({message:'create role', data:{}});
}
//find
function list(req, res, next) {
  res.json({message:'list of roles', data:[]});
}
//find by id
function find(req, res, next) {
  res.json({message:'find a role by id', data:{}});
}
//update
function update(req, res, next) {
  res.json({message:'update role by id', data:{}});
}
//destroy
function destroy(req, res, next) {
  res.json({message:'delete role by id',data:{}});
}


module.exports = {create, list, find, update, destroy}