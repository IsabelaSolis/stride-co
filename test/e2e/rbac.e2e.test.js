const { api, login, auth, waitForApi } = require('./helpers');

// Borra los datos creados y verifica que cada borrado responda 200 (o 404 si la prueba ya lo borro)
async function cleanup(path, ids, token) {
  for (const id of ids) {
    const res = await api().delete(`${path}/${id}`).set(auth(token));
    expect([200, 404]).toContain(res.statusCode);
  }
}

describe('E2E - Control de acceso basado en roles (RBAC)', () => {
  let adminToken;
  let salesToken;
  let userToken;

  const createdProductIds = [];
  const createdCustomerIds = [];
  const createdOrderIds = [];

  beforeAll(async () => {
    await waitForApi();
    adminToken = await login('admin');
    salesToken = await login('sales');
    userToken = await login('user');
  }, 95000);

  afterAll(async () => {
    await cleanup('/api/v1/orders', createdOrderIds, adminToken);
    await cleanup('/api/v1/customers', createdCustomerIds, adminToken);
    await cleanup('/api/v1/products', createdProductIds, adminToken);
  });

  describe('Permisos sobre productos (products:delete:any)', () => {
    test('ADMIN con products:delete:any elimina un producto creado por la prueba (permitido, 200)', async () => {
      //crear prodcto con admin
      const createRes = await api()
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Producto RBAC Admin Delete Test',
          brand: 'Stride',
          price: 299.99,
          description: 'Producto para prueba de eliminacion por admin'
        });

      expect(createRes.statusCode).toBe(201);
      expect(createRes.body.data).toHaveProperty('id');
      const productId = createRes.body.data.id;

      //admin elimina el producto
      const deleteRes = await api()
        .delete(`/api/v1/products/${productId}`)
        .set(auth(adminToken));

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body).toHaveProperty('message');

      const getRes = await api()
        .get(`/api/v1/products/${productId}`)
        .set(auth(adminToken));

      expect(getRes.statusCode).toBe(404);
    });

    test('SALES intenta eliminar un producto (403)', async () => {
      //crear producto con admin
      const createRes = await api()
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Producto RBAC Sales Delete Attempt',
          brand: 'Stride',
          price: 499.99
        });

      expect(createRes.statusCode).toBe(201);
      const productId = createRes.body.data.id;
      createdProductIds.push(productId);

      //esto intenta eliminar el producto 
      const deleteRes = await api()
        .delete(`/api/v1/products/${productId}`)
        .set(auth(salesToken));

      expect(deleteRes.statusCode).toBe(403);
      expect(deleteRes.body).toHaveProperty('message');

      const getRes = await api()
        .get(`/api/v1/products/${productId}`)
        .set(auth(adminToken));

      expect(getRes.statusCode).toBe(200);
    });
  });

  describe('Permisos sobre ordenes (orders:read:own vs orders:read:any)', () => {
    let customerId;

    beforeAll(async () => {
      //con esto creamos el cliente auxiliar para asociar las ordenes (ADMIN tiene customers:create:any)
      const customerRes = await api()
        .post('/api/v1/customers')
        .set(auth(adminToken))
        .send({
          userId: 1,
          phone: '614-555-0199',
          email: `rbac.customer.${Date.now()}@stride.test`,
          addresses: [
            {
              type: 'SHIPPING',
              street: 'Calle Libertad',
              number: '100',
              city: 'Chihuahua',
              state: 'Chihuahua',
              postalCode: '31000',
              country: 'MX'
            }
          ]
        });

      expect(customerRes.statusCode).toBe(201);
      customerId = customerRes.body.data._id;
      createdCustomerIds.push(customerId);
    });

    test('USER consulta su propia orden (orders:read:own) y se permite. La orden se crea en la prueba con el token de USER', async () => {
    //user crea la orden
      const createOrderRes = await api()
        .post('/api/v1/orders')
        .set(auth(userToken))
        .send({
          customerId,
          paymentMethod: 'CASH',
          totals: {
            subtotal: 350.00,
            shipping: 50.00,
            discount: 0,
            total: 400.00
          },
          items: [
            {
              productId: 1,
              quantity: 1,
              unitPrice: 350.00
            }
          ]
        });

      expect(createOrderRes.statusCode).toBe(201);
      expect(createOrderRes.body.data).toHaveProperty('_id');
      const userOrderId = createOrderRes.body.data._id;
      createdOrderIds.push(userOrderId);

    //aqui user consulta la orden 
      const getOwnOrderRes = await api()
        .get(`/api/v1/orders/${userOrderId}`)
        .set(auth(userToken));

      expect(getOwnOrderRes.statusCode).toBe(200);
      expect(getOwnOrderRes.body).toHaveProperty('data');
      expect(getOwnOrderRes.body.data._id).toBe(userOrderId);
    });

    test('USER consulta la orden creada por otro usuario (403)', async () => {
    //sales crea una orden   
      const createSalesOrderRes = await api()
        .post('/api/v1/orders')
        .set(auth(salesToken))
        .send({
          customerId,
          paymentMethod: 'TRANSFER',
          totals: {
            subtotal: 500.00,
            shipping: 0,
            discount: 0,
            total: 500.00
          },
          items: [
            {
              productId: 1,
              quantity: 2,
              unitPrice: 250.00
            }
          ]
        });

      expect(createSalesOrderRes.statusCode).toBe(201);
      const salesOrderId = createSalesOrderRes.body.data._id;
      createdOrderIds.push(salesOrderId);

      // 2. USER intenta consultar la orden creada por SALES (ajena -> denegado, 403)
      const getOtherOrderRes = await api()
        .get(`/api/v1/orders/${salesOrderId}`)
        .set(auth(userToken));

      expect(getOtherOrderRes.statusCode).toBe(403);
      expect(getOtherOrderRes.body).toHaveProperty('message');
    });
      
    //user no tiene permiso orders:read:any -> denegado, 403
    test('USER intenta listar todas las ordenes (orders:read:any) y recibe 403', async () => {
      const listOrdersRes = await api()
        .get('/api/v1/orders')
        .set(auth(userToken));

      expect(listOrdersRes.statusCode).toBe(403);
      expect(listOrdersRes.body).toHaveProperty('message');
    });
  });
});