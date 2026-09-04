
//create
function create(req, res, next) {
  res.status(201).json({message:'create permission assigned to role', data:{}});
}
//find
function list(req, res, next) {
  res.json({message:'list permissions assigned to role', data:[]});
}
//find by id
function find(req, res, next) {
  res.json({message:'find permissions assigned to this role', data:[]});
}
//destroy
function destroy(req, res, next) {
  res.json({message:'delete this permission assigned to this role',data:{}});
}

module.exports = {create, list, find,destroy}