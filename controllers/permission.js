
//create
function create(req, res, next) {
  res.status(201).json({message:'create permission', data:{}});
}
//find
function list(req, res, next) {
  res.json({message:'list of permission', data:[]});
}
//find by id
function find(req, res, next) {
  res.json({message:'find a permission by id', data:{}});
}
//update
function update(req, res, next) {
  res.json({message:'update permission by id', data:{}});
}
//destroy
function destroy(req, res, next) {
  res.json({message:'delete permission by id',data:{}});
}


module.exports = {create, list, find, update, destroy}