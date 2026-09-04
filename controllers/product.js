
//create
function create(req, res, next) {
  res.status(201).json({message:'create Product ', data:{}});
}
//find
function list(req, res, next) {
  res.json({message:'list product ', data:[]});
}
//find by id
function find(req, res, next) {
  res.json({message:'find a product  by id', data:{}});
}
//update
function update(req, res, next) {
  res.json({message:'update product  by id', data:{}});
}
//destroy
function destroy(req, res, next) {
  res.json({message:'delete product by id', data:{}});
}


module.exports = {create, list, find, update, destroy}