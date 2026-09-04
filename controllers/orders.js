
//create
function create(req, res, next) {
  res.status(201).json({message:'create order', data:{}});
}
//find
function list(req, res, next) {
  res.json({message:'list orders', data:[]});
}
//find by id
function find(req, res, next) {
  res.json({message:'find a order by id', data:{}});
}
//update
function update(req, res, next) {
  res.json({message:'update order by id', data:{}});
}
//destroy
function destroy(req, res, next) {
  res.json({message:'delete order by id',data:{}});
}


module.exports = {create, list, find, update, destroy}