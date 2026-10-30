var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {expressjwt}=require('express-jwt');
const config = require('config');
const i18n = require('./config/i18n');
//importamos el modulo de rutas 
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productRouter = require('./routes/product');
var productVariantRouter = require('./routes/productVariant');
var inventoryRouter = require('./routes/inventory');
var permissionRouter = require('./routes/permission');
var roleRouter = require('./routes/role');
var rolePermissionRouter = require('./routes/rolePermission');
var customerRouter = require('./routes/customer');
var orderRouter = require('./routes/order');

var authRouter = require('./routes/auth');
const authenticate = require('./middlewares/authenticate');
const errorHandler = require('./middlewares/errorHandler');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);

//conectamos cada router a un URL especifico
app.use('/', indexRouter);

// autenticacion: va ANTES de los routers protegidos
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', expressjwt({ secret: config.get('jwt.secret'), algorithms: [config.get('jwt.algorithm')] }));
app.use('/api/v1', authenticate);

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/variants', productVariantRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/permissions', permissionRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/rolePermissions', rolePermissionRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/orders', orderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorHandler);

module.exports = app;