
//create
function create(req, res, next) {
  res.status(201).json({message:'create customer', data:{}});
}
//find
function list(req, res, next) {
  res.json({message:'list customers', data:[]});
}
//find by id
function find(req, res, next) {
  res.json({message:'find a customer by id', data:{}});
}
//update
function update(req, res, next) {
  res.json({message:'update customer by id', data:{}});
}
//destroy
function destroy(req, res, next) {
  res.json({message:'delete customer by id',data:{}});
}


module.exports = {create, list, find, update, destroy}