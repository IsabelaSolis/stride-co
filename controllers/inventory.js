
//create
function create(req, res, next) {
  res.status(201).json({message:'create inventory', data:{}});
}
//find
function list(req, res, next) {
  res.json({message:'list product inventory', data:[]});
}
//find by id
function find(req, res, next) {
  res.json({message:'find a inventory by id', data:{}});
}
//update
function update(req, res, next) {
  res.json({message:'update inventory by id', data:{}});
}
//destroy
function destroy(req, res, next) {
  res.json({message:'delete inventory by id', data:{}});
}


module.exports = {create, list, find, update, destroy}