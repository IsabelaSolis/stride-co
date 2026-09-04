
//create
function create(req, res, next) {
  res.status(201).json({message:'create Product Variant', data:{}});
}
//find
function list(req, res, next) {
  res.json({message:'list product variant', data:[]});
}
//find by id
function find(req, res, next) {
  res.json({message:'find a product variant by id', data:{}});
}
//update
function update(req, res, next) {
  res.json({message:'update product variant by id', data:{}});
}
//destroy
function destroy(req, res, next) {
  res.json({message:'delete product variant by id', data:{}});
}


module.exports = {create, list, find, update, destroy}